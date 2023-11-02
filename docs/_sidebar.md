- [主页](README.md)

- 概述
  - [芯片简介](r128/about_chip.md)
  - [芯片参数](r128/chip_info.md)
  - [手册与资料](r128/get_chip_ds.md)
  - [测试固件下载](r128/test_img.md)
  
- R128 硬件使用说明
  - [R128 模块](devkit/r128_module.md)
  - [R128 DevKit 开发板](devkit/r128_devkit.md)
  - [R128 EVT 开发套件](devkit/r128_evt.md)
  
- 获取 SDK
  - [开发环境搭建](r128/prepare_dev_env.md)
  - [获取SDK](r128/get_sdk.md)
  
- SDK 入门
  - [SDK 入门](r128/sdk_intro.md)
  - [刷写固件](r128/flash_img.md)
  - [RTOS 使用说明](r128/rtos_manual.md)
  - [SDK架构](r128/sdk_tree.md)
  - [编写HelloWorld](r128/hello_world.md)

- 软件配置
  - [配置引脚复用](sdk_base/gpio_mux.md)
  - [RTOS 软件包配置](sdk_base/rtos_package.md)
  - [启动与资源划分](sdk_base/boot_up.md)

- 外设模块配置
  - [USB 外设功能配置](peripheral/usb.md)
  - [PMU 电源管理](peripheral/pmu.md)
  - [ADC 按键配置方法](peripheral/adc_key.md)

- 应用开发案例
  - [点亮一颗 LED 灯](demo/led_and_chihui.md)
  - [按键输入](demo/keypress.md)
  - [按键控制蜂鸣器](demo/keypressbuzz.md)
  - [ADC驱动烟雾传感器](demo/adc_mq2.md)
  - [中断方式驱动旋转编码器](demo/int_encoder.md)
  - [驱动 WS2812 流水灯](demo/ws2812.md)
  - [获取真随机数](demo/trand.md)
  - [驱动 OLED 屏](demo/oled.md)
  - [SPI 驱动 TFT LCD 屏](demo/spilcd.md)
  - [DBI 驱动 TFT LCD 屏](demo/dbilcd.md)
  - [LVGL 与 SPI TFT GUI](demo/lvgl_spi.md)
  - [SPI驱动ST7789V2.4寸LCD](demo/add_spilcd.md)
  - [SPI驱动ST7789V1.47寸LCD](demo/add_spilcd_147.md)
  - [SPI驱动ST7789V1.3寸LCD](demo/add_spilcd_13.md)
  - [DBI驱动ST7789V1.3寸LCD](demo/add_dbilcd_13.md)
  - [SPI 与 DBI 性能对比](demo/spi_vs_dbi.md)

- 基础组件开发指南
  - [RTOS 存储简介](sdk_base/rtos_storage.md)
  - [RTOS 多媒体解码](sdk_base/multimedia_dec.md)
  - [RTOS 多媒体编码](sdk_base/multimedia_enc.md)
  - [音频框架](sdk_base/audio.md)
  - [显示与屏幕驱动](sdk_base/disp.md)
  - [SPI LCD 显示驱动](sdk_base/spilcd.md)
  - [GUI 图形系统](sdk_base/graphic.md)
  - [图像采集](sdk_base/video_capture.md)
  - [RTOS 安全](sdk_base/sos.md)
  - [RTOS 蓝牙](sdk_base/bluetooth.md)
  - [Wi-Fi](sdk_base/wifi.md)
  - [异构多核通信](sdk_base/amp.md)

- SDK HAL 模块开发指南
  - [Crypto Engine](sdk_module/ce.md)
  - [CSI](sdk_module/csi.md)
  - [CCU](sdk_module/ccu.md)
  - [DMA Controller](sdk_module/dmac.md)
  - [Flash Controller](sdk_module/flash.md)
  - [GPADC](sdk_module/gpadc.md)
  - [GPIO](sdk_module/gpio.md)
  - [G2D](sdk_module/g2d.md)
  - [HWSPINLOCK](sdk_module/spin.md)
  - [IR](sdk_module/ir.md)
  - [PMU](sdk_module/pmu.md)
  - [LEDC (RGB LED)](sdk_module/ledc.md)
  - [UART](sdk_module/uart.md)
  - [LPUART](sdk_module/lpuart.md)
  - [SPI](sdk_module/spi.md)
  - [TWI](sdk_module/twi.md)
  - [SPI DBI](sdk_module/dbi.md)
  - [TRNG](sdk_module/trng.md)
  - [MBUS](sdk_module/mbus.md)
  - [MMC](sdk_module/mmc.md)
  - [MSGBOX](sdk_module/msgbox.md)
  - [PWM](sdk_module/pwm.md)
  - [RTC](sdk_module/rtc.md)
  - [SID](sdk_module/sid.md)
  - [Smart Card](sdk_module/smartcard.md)
  - [USB](sdk_module/usb.md)

- DSP 
  - [DSP 简介](dsp/dsp_intro.md)
  - [DSP开发工具安装](dsp/dsp_sdk.md)

- 调试指南
  - [RTOS调试指南](debug/debug_info.md)
  - [使用 VSCode 调试代码](debug/vsc_debug_info.md)
  - [内存泄漏](debug/memleak.md)

- 硬件设计
  - [芯片硬件设计指南](hardware/hardware_design.md)
  - [硬件设计参考](hardware/ref_hardware_design.md)
  - [芯片物料支持列表](hardware/chip_support_list.md)

- 其他
  - [FAQ](others/faq.md)
  - [术语表](others/term.md)