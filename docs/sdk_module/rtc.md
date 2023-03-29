# RTC

## 模块介绍

实时时钟 RTC 用于实现时钟计数和定时唤醒功能，能够实时显示日，时，分，秒功能。该模块电源独立，可以在系统掉电后工作，RTC 具有以下特点。

- 内部具有一个 16bit 的日计数器，5bit 的小时计数器，6bit 的分计数器，6bit 的秒计数器
- 可外接 32768Hz 低频晶振作为计数时钟
- 可随时软件配置初始值
- 具有定时闹钟功能，可产生中断及唤醒外围设备
- 14 个用户寄存器可存放掉电信息
- 多个特殊寄存器记录 BROM 相关信息

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

