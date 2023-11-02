# RTC

## 模块介绍

实时时钟 RTC 用于实现时钟计数和定时唤醒功能，能够实时显示日，时，分，秒功能。该模块电源独立，可以在系统掉电后工作，RTC 具有以下特点。

- 内部具有一个 16bit 的日计数器，5bit 的小时计数器，6bit 的分计数器，6bit 的秒计数器
- 可外接 32768Hz 低频晶振作为计数时钟
- 可随时软件配置初始值
- 具有定时闹钟功能，可产生中断及唤醒外围设备
- 14 个用户寄存器可存放掉电信息
- 多个特殊寄存器记录 BROM 相关信息
- RTC 模块记录的时间范围为 1900-2097 年。

## 模块配置

配置路径如下:

```c
Kernel Setup --->
    Drivers Setup --->
        SoC HAL Drivers --->
            rtc devices --->
                [*] enable rtc driver
```

## 源码结构

```c
rtos-hal/
|-- hal/source/rtc/hal_rtc.c                // hal层接口代码
|-- hal/source/rtc/platform/rtc_sun20iw2.h  // 平台配置
|-- include/hal/sunxi_hal_rtc.h             // 头文件
```

RTC 模块寄存器的基本配置位于文件rtc_sun20iw2.h 里面，包括每个 RTC 的寄存器地址和中断号，部分配置如下：

```c
// 寄存器基址
#define SUNXI_RTC_BASE 0x07000000
#define SUNXI_RTC_DATA_BASE (SUNXI_RTC_BASE+0x100)
// 中断
#define SUNXI_GIC_START 32
#define SUXNI_IRQ_RTC (SUNXI_GIC_START + 105)
```

## 模块接口说明

### RTC 时间结构体

该结构体用来保存 RTC 模块的时间，具体如下所示：

```c
struct rtc_time
{
    int tm_sec;  // 秒
    int tm_min;  // 分
    int tm_hour; // 时
    int tm_mday; // 天
    int tm_mon;  // 月
    int tm_year; // 年
    int tm_wday;
    int tm_yday;
    int tm_isdst;
};
```

### RTC 闹钟结构体

该结构体用来保存 RTC 模块的闹钟时间，具体如下所示：

```c
struct rtc_wkalrm
{
    unsigned char enabled; /* 0 = alarm disabled, 1 = alarm enabled */
    unsigned char pending; /* 0 = alarm not pending, 1 = alarm pending */
    struct rtc_time time;  /* time the alarm is set to */
};
```

###  RTC 初始化接口

RTC 模块初始化，主要初始化一些工作模式，中断等等

函数原型：

```c
int hal_rtc_init(void);
```

参数：

- 无

返回值：

- 0：成功
- 负数：失败

### 获取时间接口

获取时间值，保存在 rtc_tm 结构体里面

函数原型：

```c
int hal_rtc_gettime(struct rtc_time *rtc_tm);
```

参数：

- rtc_tm，保存时间的结构体参数

返回值：

- 0：成功
- 负数：失败

### 设置时间接口

设置时间值

函数原型：

```c
int hal_rtc_settime(struct rtc_time *rtc_tm);
```

参数：

- rtc_tm，设置时间的结构体参数

返回值：

- 0：成功
- 负数：失败

### 获取闹钟接口

获取闹钟数据

函数原型：

```c
int hal_rtc_getalarm(struct rtc_wkalrm *wkalrm);
```

参数：

- wkalrm，保存闹钟数据的结构体

返回值：

- 0：成功
- 负数：失败

### 设置闹钟接口

设置闹钟数据

函数原型：

```c
int hal_rtc_setalarm(struct rtc_wkalrm *wkalrm)
```

参数：

- wkalrm，保存闹钟数据的结构体

返回值：

- 0：成功
- 负数：失败

### 使能闹钟中断接口

使能闹钟中断

函数原型：

```c
int hal_rtc_alarm_irq_enable(unsigned int enabled);
```

参数：

- enabled：1使能，0失能

返回值：

- 0：成功
- 负数：失败

### 注册闹钟回调接口

注册闹钟回调接口

函数原型：

```c
int hal_rtc_register_callback(rtc_callback_t user_callback);
```

参数：

- user_callback：int callback(void) 的函数指针

返回值：

- 0：成功
- 负数：失败

## 模块使用范例

```c
#include <stdio.h>
#include <hal_log.h>
#include <hal_cmd.h>
#include <sunxi_hal_rtc.h>

static int callback(void)
{
    printf("alarm interrupt\n");
    return 0;
}

static int cmd_test_rtc(int argc, const char **argv)
{
    unsigned int enable = 1;
    struct rtc_time rtc_tm;
    struct rtc_wkalrm wkalrm;

    hal_rtc_init();

    hal_rtc_register_callback(callback);

    if (hal_rtc_gettime(&rtc_tm))
    {
        printf("sunxi rtc gettime error\n");
    }

    wkalrm.enabled = 1;
    wkalrm.time = rtc_tm;
    if(rtc_tm.tm_min > 0)
	    rtc_tm.tm_min -= 1;
    else
	    wkalrm.time.tm_min += 1;

    printf("alarm time %04d-%02d-%02d %02d:%02d:%02d\n",
           wkalrm.time.tm_year + 1900, wkalrm.time.tm_mon + 1, wkalrm.time.tm_mday,
           wkalrm.time.tm_hour, wkalrm.time.tm_min, wkalrm.time.tm_sec);

    if (hal_rtc_settime(&rtc_tm))
    {
        printf("sunxi rtc settime error\n");
    }

    if (hal_rtc_setalarm(&wkalrm))
    {
        printf("sunxi rtc setalarm error\n");
    }

    if (hal_rtc_getalarm(&wkalrm))
    {
        printf("sunxi rtc getalarm error\n");
    }

    if (hal_rtc_gettime(&rtc_tm))
    {
        printf("sunxi rtc gettime error\n");
    }

    //if do hal_rtc_alarm_irq_enable and hal_rtc_uninit, alarm will not work
    hal_rtc_alarm_irq_enable(enable);

    /* if the alarm time is less than code run,run here will close rtc, so the interrupt will not response*/
    //hal_rtc_deinit();
    return 0;
}

FINSH_FUNCTION_EXPORT_CMD(cmd_test_rtc, hal_rtc, rtc hal APIs tests)
```

