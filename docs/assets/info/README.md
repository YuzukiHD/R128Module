| 项目          | ESP32-S3-WROOM-N16R8      | M1(K210)                 | M1s(BL808)                                       | R128-S3 Module                         | R128-S2 Module           |
|-------------|---------------------------|--------------------------|--------------------------------------------------|--------------------------------------------------|--------------------------------------------------|
| CPU         | Xtensa LX7@240MHz x2      | RV64@400MHz x2           | RV64GCV@480MHz<br />RV32GCP@320MHz<br />RV32EMC@160MHz | RV64GCV@600MHz<br />Arm Cortex-M33 @240MHz<br />HiFi5 Audio DSP Xtensa LX7@400MHz | RV64GCV@600MHz<br />Arm Cortex-M33 @240MHz<br />HiFi5 Audio DSP Xtensa LX7@400MHz |
| RAM         | 512KB SRAM + 8MB PSRAM | 8MB SRAM                 | 768KB SRAM + 64MB UHS PSRAM(2000MHz)         | 1MB SRAM + 8M LS_PSRAM + 32M HS_PSRAM | 1MB SRAM + 8M LS_PSRAM + 8M HS_PSRAM |
| Flash       | 16MB NOR                  | 16MB NOR                 | 16MB NOR                                       | 32MB NOR                        | 16MB NOR               |
| OS          | RTOS                      | FreeRTOS No-mmu Linux | FreeRTOS Linux                                | FreeRTOS 10.4 For RISC-V, Arm Core<br />FreeRTOS 10.2 For HIFI5 DSP | FreeRTOS 10.4 For RISC-V, Arm Core<br />FreeRTOS 10.2 For HIFI5 DSP |
| NPU         || 230GOPS with limited OPS | 100GOPS with rich OPS                            | HiFi5 Neural Network | HiFi5 Neural Network |
| Camera      | DVP                       | DVP, up to VGA           | MIPI + DVP, up to 1080P h264                     | DVP, up to UXGA     | DVP, up to UXGA  |
| Display     | SPI 8bits MCU LCD      | SPI 8bits MCU LCD     | SPI, 8bits MCU LCD, RGB LCD                 | SPI, MCU LCD, RGB666 LCD | SPI, MCU LCD, RGB666 LCD |
| Audio       | I2S                       | I2S                      | I2S, Analog Audio Input/Output | 3 Audio ADC, 24Bit, 8kHz-96kHz<br />1 Audio DAC, 24Bit, 8kHz-384kHZ<br />I2S |3 Audio ADC, 24Bit, 8kHz-96kHz<br />2 Audio DAC, 24Bit, 8kHz-384kHZ<br />I2S|
| Wireless    | WIFI+BLE                  |                          | WIFI+BLE+Zigbee                        | WIFI 802.11 + BLE | WIFI 802.11 + BLE |
| USB         |USB1.1 OTG|                          | USB2.0 OTG HS                          | USB2.0 OTG HS                          | USB2.0 OTG HS |
| Accelerator || FFT                      | Scaler  OSD  MJPED  G2D  H264              | JPEG, G2D | JPEG, G2D |
| Perpheral   | UART, SPI, IIC, SDIO, ADC | UART, SPI, IIC           | UART, SPI, IIC, SDIO ETH(RMII), ADC/DAC          | UART, SPI, IIC, SDIO, ADC/DAC, OWA, IC Card, LEDC, IR | UART, SPI, IIC, SDIO, ADC/DAC, OWA, IC Card. LEDC, IR |
| Size        | 25.5 x 18 mm              | 25.4 x 25.4 mm           | 31 x 18 mm                                       | 25.5 x 18 mm                           | 25.5 x 18 mm |
| Price       | $4.3(digikey)             | $6                       | $6                                               | $5.5                               | $4.3 |

