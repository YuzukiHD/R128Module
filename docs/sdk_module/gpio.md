# GPIO

## 模块介绍

整个 GPIO 控制器由数字部分（GPIO 和外设接口）以及 IO 模拟部分（输出缓冲，双下拉，引脚Pad）组成。其中数字部分的输出可以通过 MUX 开关选择，模拟部分可以用来配置上下拉，驱动能力以及引脚输出电压等等。具体的规格如下：

- 可以在软件上配置各个引脚的状态
- 每个引脚都可以触发中断
- 可以配置 上拉/下拉/无上下拉 三种状态
- 每个引脚都可以配置 4 种驱动能力
- 可以配置边缘中断触发
- 最高 99 个中断

## 模块配置

其 menuconfig 的配置如下：

```
Kernel Setup --->
    Drivers Setup --->
        SoC HAL Drivers --->
            GPIO devices --->
                [*] enable GPIO driver
                [*] enbale GPIO hal APIs Test command
```

## 源码结构

GPIO 模块源码结构如下所示：

```
rtos-hal/source/gpio/
│-- gpio.h                 # 模块内部公共头文件
│-- hal_gpio.c             # 公共操作接口
├─  sun20iw2               # sun20iw2 平台的实现
    │---- gpio-sun20iw2.c  # GPIO具体实现
    │---- platform-gpio.h  # 实现头文件
    
include/hal/               # 驱动APIs声明头文件
└── hal_gpio.h
```

- `platform-gpio.h` 主要包含 GPIO 控制器基地址、GPIO 中断号、pin 的声明等信息
- `gpio-sun20iw2.c` 主要包含每个平台的 GPIO 描述符配置

## 模块接口说明

### 数据结构

由于 GPIO 需要配置每个引脚的引脚复用功能，中断类型，驱动能力，上下拉，输出/输入数据，输入/输出方向等等，所以对 GPIO 的这些配置都封装在一个 enum 枚举结构里面，方便使用。下面是一些配置的定义。想要了解更多的可以到 hal_gpio.h 查看

#### 引脚定义 gpio_pin_t

该枚举定义了可用的每个引脚定义，在配置引脚的时候将相关参数传入则可，具体定义如下：

```c
typedef enum
{
    GPIO_PC0 = GPIOC(0),
    GPIO_PC1 = GPIOC(1),
    GPIO_PC2 = GPIOC(2),
    GPIO_PC3 = GPIOC(3),
    ...
    GPIO_PL0 = GPIOL(0),
    GPIO_PL1 = GPIOL(1),
    GPIO_PL2 = GPIOL(2),
    GPIO_PL3 = GPIOL(3),
    GPIO_PL4 = GPIOL(4),
    GPIO_PL5 = GPIOL(5),
} gpio_pin_t;
```

#### 引脚驱动能力 gpio_driving_level_t

该枚举定义了引脚的驱动能力的值，具体定义如下：

```c
typedef enum
{
    GPIO_DRIVING_LEVEL0 = 0, /**< Defines GPIO driving current as level0. */
    GPIO_DRIVING_LEVEL1 = 1, /**< Defines GPIO driving current as level1. */
    GPIO_DRIVING_LEVEL2 = 2, /**< Defines GPIO driving current as level2. */
    GPIO_DRIVING_LEVEL3 = 3  /**< Defines GPIO driving current as level3. */
} gpio_driving_level_t;
```

#### 引脚上下拉 gpio_pull_status_t

该枚举定义了引脚的上下拉的值，具体定义如下：

```c
typedef enum
{
    GPIO_PULL_DOWN_DISABLED = 0, /**< Defines GPIO pull up and pull down disable.*/
    GPIO_PULL_UP = 1,            /**< Defines GPIO is pull up state. */
    GPIO_PULL_DOWN = 2,          /**< Defines GPIO is pull down state. */
} gpio_pull_status_t;
```

#### 引脚数据 gpio_data_t

该枚举定义引脚的输入输出数据，具体定义如下：

```c
typedef enum
{
    GPIO_DATA_LOW = 0, /**< GPIO data low. */
    GPIO_DATA_HIGH = 1 /**< GPIO data high. */
} gpio_data_t;
```

#### 引脚电压能力 gpio_power_mode_t

该枚举定义了引脚的电压模式，可以配置成 1.8V 和 3.3V，具体定义如下

```c
typedef enum
{
    POWER_MODE_330 = 0,
    POWER_MODE_180 = 1
} gpio_power_mode_t;
```

#### 中断模式 gpio_interrupt_mode_t

该枚举定义了引脚的中断模式，具体定义如下：

```c
typedef enum
{
    IRQ_TYPE_NONE = 0x00000000,
    IRQ_TYPE_EDGE_RISING = 0x00000001,
    IRQ_TYPE_EDGE_FALLING = 0x00000002,
    IRQ_TYPE_EDGE_BOTH = (IRQ_TYPE_EDGE_FALLING | IRQ_TYPE_EDGE_RISING),
    IRQ_TYPE_LEVEL_HIGH = 0x00000004,
    IRQ_TYPE_LEVEL_LOW = 0x00000008,
} gpio_interrupt_mode_t;
```

### GPIO 驱动初始化

函数原型：

```c
int hal_gpio_init(void);
```

参数：

- 无

返回值

- true：合法
- false：非法

### 判断 GPIO 的合法性

函数原型：

```c
bool hal_gpio_check_valid(gpio_pin_t pin);
```

参数：

- pin：id

返回值

- true：合法
- false：非法

### 获取指定 GPIO 的电平状态

函数原型：

```c
int hal_gpio_get_data(gpio_pin_t pin, gpio_data_t *data);
```

参数：

- pin：pin id
- data：存放数据的指针变量

返回值

- -1：失败
- 0：成功

### 设置指定 GPIO 的电平状态

函数原型：

```c
int hal_gpio_set_data(gpio_pin_t pin, gpio_data_t data);
```

参数：

- pin：pin id
- 需设置的电平高低

返回值

- -1：失败
- 0：成功

### 设置指定 GPIO 的 IO 模式

函数原型：

```c
int hal_gpio_set_direction(gpio_pin_t pin, gpio_direction_t direction);
```

参数：

- pin：pin id
- direction：需设置的 IO 模式

返回值

- -1：失败
- 0：成功

### 获取指定 GPIO 的 IO 模式

函数原型：

```c
int hal_gpio_get_direction(gpio_pin_t pin, gpio_direction_t *direction);
```

参数：

- pin：pin id
- direction：存放IO的指针变量

返回值

- -1：失败
- 0：成功

### 设置指定 GPIO 的上下拉状态

函数原型：

```c
int hal_gpio_set_pull(gpio_pin_t pin, gpio_pull_status_t pull);
```

参数：

- pin：pin id
- pull：需设置的上下拉状态

返回值

- -1：失败
- 0：成功

### 获取指定 GPIO 的上下拉状态

函数原型：

```c
int hal_gpio_get_pull(gpio_pin_t pin, gpio_pull_status_t *pull);
```

参数：

- pin：pin id
- pull：存放上下拉状态的指针变量

返回值

- -1：失败
- 0：成功

### 设置指定 GPIO 的驱动能力

函数原型：

```c
int hal_gpio_set_driving_level(gpio_pin_t pin, gpio_driving_level_t level);
```

参数：

- pin：pin id
- level：需设置的驱动能力

返回值

- -1：失败
- 0：成功

### 获取指定 GPIO 的驱动能力

函数原型：

```c
int hal_gpio_get_driving_level(gpio_pin_t pin, gpio_driving_level_t *level);
```

参数：

- pin：pin id
- level：存放驱动能力的指针变量

返回值

- -1：失败
- 0：成功

### 设置指定 GPIO 的复用功能

函数原型：

```c
int hal_gpio_pinmux_set_function(gpio_pin_t pin, gpio_muxsel_t function_index);
```

参数：

- pin：pin id
- function_index：需设置的复用功能

返回值

- -1：失败
- 0：成功

### 获取指定 GPIO 的复用功能

函数原型：

```c
int hal_gpio_pinmux_get_function(gpio_pin_t pin, gpio_muxsel_t *function_index);
```

参数：

- pin：pin id
- function_index：需设置的复用功能的指针变量

返回值

- -1：失败
- 0：成功

### 设置指定 GPIO 组的电压模式

函数原型：

```c
int hal_gpio_sel_vol_mode(gpio_pin_t pins, gpio_power_mode_t pm_sel);
```

参数：

- pin：pin id
- pm_sel：需设置的电压模式

返回值

- -1：失败
- 0：成功

### 设置指定 GPIO 组的中断采样频率

函数原型：

```c
int hal_gpio_set_debounce(gpio_pin_t pin, unsigned value);
```

参数：

- pin：pin id
- value：需设置的值（bit0-clock select; bit6:4-clock pre-scale）

返回值

- -1：失败
- 0：成功

### 获取指定 GPIO 的 IRQ 中断号

函数原型：

```c
int hal_gpio_to_irq(gpio_pin_t pin, uint32_t *irq);
```

参数：

- pin：pin id
- irq：存放中断号的指针变量

返回值

- -1：失败
- 0：成功

### GPIO 中断申请

函数原型：

```c
int hal_gpio_irq_request(uint32_t irq, hal_irq_handler_t hdle, unsigned long flags, void *data);
```

参数：

- irq：中断号
- hdle：中断处理函数
- flag：中断触发模式
- data：数据指针

返回值

- -1：失败
- 0：成功

### GPIO 中断释放

函数原型：

```c
int hal_gpio_irq_free(uint32_t irq);
```

参数：

- irq：中断号

返回值

- -1：失败
- 0：成功

### 使能 GPIO 中断

函数原型：

```c
int hal_gpio_irq_enable(uint32_t irq);
```

参数：

- irq：中断号

返回值

- -1：失败
- 0：成功

### 关闭 GPIO 中断

函数原型：

```c
int hal_gpio_irq_disable(uint32_t irq);
```

参数：

- irq：中断号

返回值

- -1：失败
- 0：成功

## 模块使用范例

```c
#include <stdint.h>

#include <hal_log.h>
#include <hal_cmd.h>
#include <hal_interrupt.h>
#include <hal_gpio.h>

#include <hal_gpio.h>

#define GPIO_TEST		GPIO_PA1          // 待测试的 GPIO
#define GPIO_PORT_MAX (8)

static int pins_number[GPIO_PORT_MAX] = {
    22, /* PA pins num */
    12, /* PC pins num */
    23, /* PD pins num */
    18, /* PE pins num */
    7,  /* PF pins num */
    8,  /* PG pins num */
    16, /* PH pins num */
    5,  /* PI pins num */
};

static void cmd_usage(void)
{
	printf("Usage:\n"
		"\t hal_gpio_cmd <cmd> <gpio> <arg>\n");
}

enum {
	GPIO_CMD_SET_VOL = 0,
};

static hal_irqreturn_t gpio_irq_test(void *data)
{
    hal_log_info("fake gpio interrupt handler");

    return 0;
}

int cmd_test_gpio(int argc, char **argv)
{
    uint32_t irq;
    int ret = 0;
    gpio_pull_status_t pull_state;
    gpio_direction_t gpio_direction;
    gpio_data_t gpio_data;
    gpio_muxsel_t function_index;

    hal_gpio_get_pull(GPIO_TEST, &pull_state);
    hal_gpio_get_direction(GPIO_TEST, &gpio_direction);
    hal_gpio_get_data(GPIO_TEST, &gpio_data);
    hal_gpio_pinmux_get_function(GPIO_TEST,&function_index);

    hal_log_info("Original: pin: %d pull state: %d, dir: %d, data: 0x%0x, function_index: %d",
                 GPIO_TEST, pull_state, gpio_direction, gpio_data, function_index);

    hal_log_info("Setting: pin: %d pull state: %d, dir: %d, data: 0x%x, function_index: %d",
                 GPIO_TEST, GPIO_PULL_UP, GPIO_DIRECTION_OUTPUT, GPIO_DATA_HIGH, GPIO_MUXSEL_OUT);

    hal_gpio_set_pull(GPIO_TEST, GPIO_PULL_UP);
    hal_gpio_set_direction(GPIO_TEST, GPIO_DIRECTION_OUTPUT);
    hal_gpio_set_data(GPIO_TEST, GPIO_DATA_HIGH);
    hal_gpio_pinmux_set_function(GPIO_TEST,GPIO_MUXSEL_OUT);

    hal_gpio_get_pull(GPIO_TEST, &pull_state);
    hal_gpio_get_direction(GPIO_TEST, &gpio_direction);
    hal_gpio_get_data(GPIO_TEST, &gpio_data);
    hal_gpio_pinmux_get_function(GPIO_TEST,&function_index);

    hal_log_info("Results: pin: %d pull state: %d, dir: %d, data: 0x%0x, function_index: %d",
                 GPIO_TEST, pull_state, gpio_direction, gpio_data, function_index);

    if (pull_state == GPIO_PULL_UP
            && gpio_direction == GPIO_DIRECTION_OUTPUT
            && gpio_data == GPIO_DATA_HIGH
	    && function_index == GPIO_MUXSEL_OUT)
    {
        hal_log_info("Test hal_gpio_set_pull API success!");
        hal_log_info("Test hal_gpio_set_direction API success!");
        hal_log_info("Test hal_gpio_set_data API success!");
        hal_log_info("Test hal_gpio_pinmux_set_function API success!");
        hal_log_info("Test hal_gpio_get_pull API success!");
        hal_log_info("Test hal_gpio_get_direction API success!");
        hal_log_info("Test hal_gpio_get_data API success!");
        hal_log_info("Test hal_gpio_pinmux_get_function API success!");
    } else {
        hal_log_err("Test API fail");
        goto failed;
    }

    ret = hal_gpio_to_irq(GPIO_TEST, &irq);
    if (ret < 0)
    {
        hal_log_err("gpio to irq error, irq num:%d error num: %d", irq, ret);
        goto failed;
    } else {
        hal_log_info("Test hal_gpio_to_irq API success!");
    }

    ret = hal_gpio_irq_request(irq, gpio_irq_test, IRQ_TYPE_EDGE_RISING, NULL);
    if (ret < 0)
    {
        hal_log_err("request irq error, irq num:%d error num: %d", irq, ret);
        goto failed;
    } else {
        hal_log_info("Test hal_gpio_irq_request API success!");
    }

    ret = hal_gpio_irq_enable(irq);
    if (ret < 0)
    {
        hal_log_err("request irq error, error num: %d", ret);
        goto failed;
    } else {
        hal_log_info("Test hal_gpio_irq_enable API success!");
    }

    ret = hal_gpio_irq_disable(irq);
    if (ret < 0)
    {
        hal_log_err("disable irq error, irq num:%d, error num: %d", irq, ret);
        goto failed;
    } else {
        hal_log_info("Test hal_gpio_irq_disable API success!");
    }

    ret = hal_gpio_irq_free(irq);
    if (ret < 0)
    {
        hal_log_err("free irq error, error num: %d", ret);
        goto failed;
    } else {
        hal_log_info("Test hal_gpio_irq_free API success!");
    }

    hal_log_info("Test gpio hal APIs success!");

    return 0;

failed:
    hal_log_err("Test gpio hal APIs failed!");
    return -1;
}

int cmd_test_gpio_all(int argc, char **argv)
{
    int i = 0;
    int j =0;
    int cnt = 0;
    int ret = 0;
    uint32_t irq;
    gpio_pin_t pin;
    gpio_pull_status_t pull_state;
    gpio_direction_t gpio_direction;
    gpio_data_t gpio_data;

    hal_log_info("The program will test all gpio hal APIs ...\n");

    for(i = 0; i < GPIO_PORT_MAX; i++)
    {
        for(j = 0; j < pins_number[i]; j++)
        {
            switch(i)
            {
            case 0: pin = GPIOA(j); break;
            case 1: pin = GPIOC(j); break;
            case 2: pin = GPIOD(j); break;
            case 3: pin = GPIOE(j); break;
            case 4: pin = GPIOF(j); break;
            case 5: pin = GPIOG(j); break;
            case 6: pin = GPIOH(j); break;
            case 7: pin = GPIOI(j); break;
            default: break;
            }
            hal_log_info("Setting: pull state: %d, dir: %d, data: 0x%x, pin: %d",
                            GPIO_PULL_DOWN, GPIO_DIRECTION_INPUT, GPIO_DATA_LOW, pin);

            hal_gpio_set_pull(pin, GPIO_PULL_DOWN);
            hal_gpio_set_direction(pin, GPIO_DIRECTION_INPUT);
            hal_gpio_set_data(pin, GPIO_DATA_LOW);

            hal_gpio_get_pull(pin, &pull_state);
            hal_gpio_get_direction(pin, &gpio_direction);
            hal_gpio_get_data(pin, &gpio_data);

            hal_log_info("Results: pull state: %d, dir: %d, data: 0x%0x",
                            pull_state, gpio_direction, gpio_data);

            if(pull_state != GPIO_PULL_DOWN
                   || gpio_direction != GPIO_DIRECTION_INPUT
                   || gpio_data != GPIO_DATA_LOW)
                    goto failed;

            ret = hal_gpio_to_irq(pin, &irq);
            if(ret < 0)
                    goto failed;

            ret = hal_gpio_irq_request(irq, gpio_irq_test, IRQ_TYPE_EDGE_FALLING, NULL);
            if(ret < 0)
                    goto failed;

            ret = hal_gpio_irq_enable(irq);
            if(ret < 0)
                    goto failed;

            ret = hal_gpio_irq_disable(irq);
            if(ret < 0)
                    goto failed;

            ret = hal_gpio_irq_free(irq);
            if(ret < 0)
                    goto failed;

            cnt++;
            hal_log_info("Test-%d: gpio pin %d hal success!\n", cnt, pin);
        }
    }

    hal_log_info("Test all gpio hal APIs success, cnt: %d!", cnt);
    return 0;

failed:
    hal_log_err("Test all gpio hal APIs failed!");
    return -1;
}

int cmd_test_gpio_cmd(int argc, char **argv)
{
    int cmd, gpio, arg;

    if (argc != 4)
        cmd_usage();

    cmd = strtol(argv[1], NULL, 0);
    gpio = strtol(argv[2], NULL, 0);
    arg = strtol(argv[3], NULL, 0);

    switch (cmd) {
        case GPIO_CMD_SET_VOL:
            hal_gpio_sel_vol_mode(gpio, arg);
            break;
        default:
            break;
    }

    return 0;
}

FINSH_FUNCTION_EXPORT_ALIAS(cmd_test_gpio, hal_gpio, gpio hal APIs tests);
FINSH_FUNCTION_EXPORT_ALIAS(cmd_test_gpio_cmd, hal_gpio_cmd, gpio hal APIs tests with cmd);
FINSH_FUNCTION_EXPORT_ALIAS(cmd_test_gpio_all, hal_gpio_all, gpio hal all APIs tests);
```

