# 芯片简介

R128是一颗专为“音视频解码”而打造的全新高集成度 SoC，主要应用于智能物联和专用语音交互处理解决方案。

- 单片集成 MCU+RISCV+DSP+CODEC+WIFI/BT+PMU，提供生态配套成熟、完善的用于系统、应用和网络连接开发的高效算力；
- 集成 8MB/16MB/32MB PSRAM，为音视频解码、大容量存储、扫码以及网络连接提供充裕的高容量、高带宽的内存支持；
- 拥有丰富的音频接口 IIS/PCM、OWA、DMIC、LINEOUT、MICIN 以及通用通讯接口 IIC、UART、SDIO、 SPI、ISO7816卡接口；同时支持 U 盘、SD卡、IR-TX/RX；
- 内置 LDO、GPADC、LEDC，简化系统方案设计，降低 BOM成本。

## 不同版本芯片的区别

R128 共有R128-S1、R128-S2 和R128-S3 三个型号，各型号具体配置差异如下表：

| Contents | R128-S1               | R128-S2                     | R128-S3                      |
| -------- | --------------------- | --------------------------- | ---------------------------- |
| CPU      | M33 + C906            | M33 + C906                  | M33 + C906                   |
| DSP      | HiFi5                 | HiFi5                       | HiFi5                        |
| PSRAM    | 8MB HS-PSRAM          | 8MB HS-PSRAM + 8MB LS-PSRAM | 32MB HS-PSRAM + 8MB LS-PSRAM |
| FLASH    | 8MB                   | 16MB                        | /                            |
| DAC      | 2 Audio DAC           | 2 Audio DAC                 | 1 Audio DAC                  |
| Package  | QFN80 8*8mm 0.35pitch | QFN80 8*8mm 0.35pitch       | QFN80 8*8mm 0.35pitch        |

请注意，R128-S1、R128-S2引脚封装是相同的，而R128-S3与R128-S1、R128-S2是不同的。具体请参照《R128_PINOUT.xlsx》

