# PWM

## 模块介绍

脉冲宽度调制（PWM）是一种对模拟信号电平进行数字编码的方法。通过高分辨率计数器的使用，方波的占空比被调制用来对一个具体模拟信号的电平进行编码。PWM 具有以下特点：

- 支持脉冲（脉冲个数可配）、周期和互补对输出；
- 支持捕捉输入；
- 带可编程死区发生器，死区时间可控；
- 0-24M/100M 输出频率范围、0%-100% 占空比可调、最小分辨率 1/65536；
- 支持 PWM 输出和捕捉输入产生中断；
- 支持 PWM 组模式，同组内各个通道起始相位可配置。

## 模块配置

配置路径如下:

```
Kernel Setup --->
    Drivers Setup --->
        SoC HAL Drivers --->
            pwm devices --->
                [*] enable pwm driver
```

## 源码结构

```c
rtos-hal/
|--hal/source/pwm/hal_pwm.c    // hal层接口代码
|--include/hal/sunxi_hal_pwm.h // 头文件
```

## 模块接口说明

头文件

```c
#include <sunxi_hal_pwm.h>
```

### 返回值枚举

```c
typedef enum {
	HAL_PWM_STATUS_ERROR_PARAMETER = -3,
	HAL_PWM_STATUS_ERROR_CHANNEL = -2,
	HAL_PWM_STATUS_ERROR = -1,
	HAL_PWM_STATUS_OK = 0
} hal_pwm_status_t;
```

###  PWM 初始化接口

PWM 模块初始化，主要完成 clk 初始化

函数原型：

```c
pwm_status_t hal_pwm_init(void)
```

参数：

- 

返回值：

- 0：成功
- 负数：失败



### PWM 通道配置接口

配置 PWM 模块某个通道，包括周期、占空比和极性

函数原型：

```c
pwm_status_t hal_pwm_control(int channel, struct pwm_config *config_pwm)
```

参数：

- channel 代表通道号
- config_pwm 代表该通道的配置参数

返回值：

- 0：成功
- 负数：失败



### PWM 通道使能接口

使能 PWM 模块某个通道

函数原型：

```c
void hal_pwm_enable_controller(uint32_t channel_in)
```

参数：

- channel_in 代表通道号

返回值：

- 无



### PWM 去初始化接口

PWM 模块去初始化，主要关闭 clk

函数原型：

```c
pwm_status_t hal_pwm_deinit(void)
```

参数：

- 无

返回值：

- 0：成功
- 负数：失败

## 模块使用范例

```C
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include <unistd.h>

#include <hal_log.h>
#include <hal_cmd.h>
#include <sunxi_hal_pwm.h>

#if defined(CONFIG_ARCH_DSP)
#include <delay.h>
#define sleep(sec) msleep(sec * 1000)
#endif

#ifndef printfFromISR
#define printfFromISR printf
#endif

static int cmd_test_pwm(int argc, char **argv)
{

    struct pwm_config *config;
    uint8_t port;
    //uint8_t ns;
    int period, duty;

    if (argc < 4)
    {
        hal_log_info("Usage: pwm port | duty | period\n");
        return -1;
    }

    hal_log_info("Run pwm hal layer test case\n");

    port = strtol(argv[1], NULL, 0);
    hal_log_info("port = %d", port);
    duty = strtoul(argv[2], NULL, 0);
    period = strtoul(argv[3], NULL, 0);

    config = (struct pwm_config *)malloc(sizeof(struct pwm_config));

    config->duty_ns   = duty;
    config->period_ns = period;
    config->polarity  = PWM_POLARITY_NORMAL;
    hal_log_info("duty_ns = %d \n", config->duty_ns);
    hal_log_info("period_ns = %d \n", config->period_ns);
    hal_log_info("polarity = %d \n", config->polarity);

    hal_pwm_init();

    hal_pwm_control(port, config);

    hal_log_info("control pwm test finish\n");

    return 0;
}

FINSH_FUNCTION_EXPORT_CMD(cmd_test_pwm, hal_pwm, pwm hal APIs tests)

static int cmd_release_pwm_channel(int argc, char **argv)
{

    struct pwm_config *config;
    uint8_t port;
    uint8_t ns;
    ulong period, duty;

    if (argc < 2)
    {
        hal_log_info("Usage: pwm port\n");
        return -1;
    }

    hal_log_info("Run close pwm channel test case\n");

    port = strtol(argv[1], NULL, 0);
    hal_log_info("port = %d", port);

    hal_pwm_release(port);

    hal_log_info("release pwm channel finish\n");

    return 0;
}

FINSH_FUNCTION_EXPORT_CMD(cmd_release_pwm_channel, hal_pwm_close, release pwm channel hal APIs tests)

static void pwm_cap_callback(void* param)
{
	hal_pwm_cap_info *info = (hal_pwm_cap_info *)param;

	printfFromISR("pwm%d capture callback, cnt is %d, period is %d, duty is %d\n", info->channel, info->cnt, info->period, info->duty);
}

hal_pwm_status_t pwm_capture_init(uint32_t channel)
{

	hal_pwm_cap_enable(channel, pwm_cap_callback);

	return HAL_PWM_STATUS_OK;
}

hal_pwm_status_t pwm_capture_deinit(uint32_t channel)
{
	hal_pwm_cap_disable(channel);

	return HAL_PWM_STATUS_OK;
}

void cmd_pwm_capture_help(void)
{
	printf("pwm capture test, stop capture after 10s\n");
	printf("usage: pwm_capture_test<channel>\n");
	printf("\t<channel>: 0 ~ 15\n");
	printf("eg: pwm_capture_test 0, pwm0 capture function\n");
}

int cmd_pwm_capture(int argc, char *argv[])
{
	int count = 0;

	if (argc != 2 || atoi(argv[1]) > 15) {
		cmd_pwm_capture_help();
		return -1;
	}

	/* capture setting */
	pwm_capture_init(atoi(argv[1]));

	for(count = 0; count < 10; count++) {
		sleep(1);
	}

	/* disable */
	pwm_capture_deinit(atoi(argv[1]));

	printf("[%s]: pwm stop capture ssd\n", __func__);

	return 0;
}

FINSH_FUNCTION_EXPORT_CMD(cmd_pwm_capture, pwm_capture_test, pwm capture test)
```

