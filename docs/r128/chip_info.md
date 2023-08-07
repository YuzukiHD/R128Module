# 芯片参数

## 芯片特性

```
- XuanTie 64 bit RISC V C 906 CPU
- HiFi5 Audio DSP
- Arm M33 Star MCU

- Memories

  - 1MB SRAM

  - SiP 8 MB/16 MB Flash

  - 8 MB H S PSRAM in R128 S 1
  - 8 MB LS PSRAM & 8 MB HS PSRAM in R128 S2
  - 32 MB HS PSRAM in R128 S3
  - 2048 bit efuse

- Image and Graphics

  - Supports Graphic 2D accelerator with rotate, mixer, and 4 layers
  - Supports RGB output interface, up to 1024 x 768 @60 fps
  - Supports display engine

- Video Input

  - 8 bit parallel CSI interface
  - Supports both online and offline mode for JPEG encoder
  - Supports JPEG encoder, 1920 x 108 8

- Analog Audio Codec

  - 2 DAC channels 24 bit audio codec for R128 S1 and R128 S2
  - 1 DAC channel 24 bit for R128 S3
  - 3 ADC channels
  - Supports USB audio playback
  - Up to 119 dB SNR during DAC playback path (signal through DAC and lineout with A weighted filter)
  - Up to 98 dB SNR during ADC record path (signal through PGA and ADC with A weighted filter)

- One I2S/TDM/PCM external inte rface (I2S0

- Security Engine

  - Symmetrical algorithm: AES, DES, 3DES
  - Hash algorithm: MD5, SHA1, SHA224, SHA256, SHA384, SHA512, HMAC
  - Asymmetrical algorithm: RSA512/1024/2048bit
  - S upports TRNG

- External Peripherals

  - One USB 2.0 DRD
  - Up to 3 UART controllers (UART 0, UART1, UART2)
  - Up to 2 SPI controllers (SPI0, SPI1)
  - Up to 2 TWIs
  - One CIR RX and one CIR TX
  - Up to 8 PWM channels (PWM[ 7 0
  - Up to 7 GPADC input channels (R128 S1 & R128 S2)/8 channels (R128 S3)
  - One LEDC used to control the external intelligent control LED lamp

- Package

  - QFN80, 0.35 mm pitch, 8 mm x 8 mm body
```

## GPIO 复用

| Pin Name               | GPIO Group | IO Type | Function 2                        | Function 3                 | Function 4  | Function 5   | Function6                         | Function7    | Function8 | Function 14 |
| ---------------------- | ---------- | ------- | --------------------------------- | -------------------------- | ----------- | ------------ | --------------------------------- | ------------ | --------- | ----------- |
| PA0                    | GPIOA      | I/O     | IR-RX                             |                            | PWM7        | TWI0-SCL     | TWI1-SCL                          | LCD-VSYNC    | LCD-D2    | PA-EINT0    |
| PA1/FEL0               | GPIOA      | I/O     | IR-TX                             | FEM-CTRL1                  | IR-RX       | TWI0-SDA     | TWI1-SDA                          |              | LCD-D3    | PA-EINT1    |
| PA2/FEL1               | GPIOA      | I/O     | SPI1-CS<DBI-CSX>                  | DMIC-DATA0                 | JTAG-RV-TMS | SDC-DATA1    | I2S-LRCLK                         | JTAG-DSP-TMS | LCD-D4    | PA-EINT2    |
| PA3                    | GPIOA      | I/O     | SPI1-CLK<DBI-SCLK>                | DMIC-DATA1                 | JTAG-RV-TDI | SDC-DATA0    | I2S-BCLK                          | JTAG-DSP-TDI | LCD-D5    | PA-EINT3    |
| PA4                    | GPIOA      | I/O     | SPI1-MOSI<DBI-SDO>                | DMIC-DATA2                 | UART0-TX    | SDC-CLK      | I2S-DIN                           | PWM1         | LCD-D6    | PA-EINT4    |
| PA5                    | GPIOA      | I/O     | SPI1-MISO<DBI-SDI/DBI-TE/DBI-DCX> | DMIC-DATA3                 | JTAG-RV-TDO | SDC-CMD      | I2S-DOUT                          | JTAG-DSP-TDO | LCD-D7    | PA-EINT5    |
| PA6                    | GPIOA      | I/O     | SPI1-HOLD<DBI-DCX/DBI-WRX>        | DMIC-CLK                   | UART0-RX    | SDC-DATA3    | I2S-MCLK                          | LCD-CLK      | LCD-D14   | PA-EINT6    |
| PA7                    | GPIOA      | I/O     | SPI1-WP<DBI-TE>                   | OWA-IN                     | JTAG-RV-TCK | SDC-DATA2    | JTAG-DSP-TCK                      | LCD-HSYNC    | LCD-D13   | PA-EINT7    |
| PA8                    | GPIOA      | I/O     | UART0-RX                          | OWA-OUT                    | PWM0        | OWA-IN       | TWI1-SCL                          | FEM-CTRL2    | LCD-D12   | PA-EINT8    |
| PA9                    | GPIOA      | I/O     | UART0-TX                          |                            | PWM1        | LEDC         | TWI1-SDA                          | LCD-DE       | LCD-D15   | PA-EINT9    |
| PA10                   | GPIOA      | I/O     | UART2-RTS                         | IR-RX                      | PWM2        | TWI1-SCL     |                                   |              | LCD-D11   | PA-EINT10   |
| PA11/WUPIO0            | GPIOA      | I/O     | UART2-CTS                         | IR-TX                      | PWM3        | TWI1-SDA     | 32KOSCO                           | FEM-CTRL1    | LCD-D10   | PA-EINT11   |
| PA12/WUPIO1/ LXTAL-IN  | GPIOA      | I/O     | UART2-TX                          | TWI0-SCL                   | UART2-RTS   | IR-RX        | SPI1-CS/DBI-CSX                   | LCD-VSYNC    | LCD-D18   | PA-EINT12   |
| PA13/WUPIO2/ LXTAL-OUT | GPIOA      | I/O     | UART2-RX                          | TWI0-SDA                   | UART2-CTS   | IR-TX        | SPI1-CLK/DBI-SCLK                 | LEDC         | LCD-D19   | PA-EINT13   |
| PA14/WUPIO3            | GPIOA      | I/O     | PWM0                              | SPI1-MOSI<DBI-SDO>         | UART2-RX    | SIM-DATA     | UART1-RTS                         | TWI1-SCL     | LCD-D20   | PA-EINT14   |
| PA15                   | GPIOA      | I/O     | PWM1                              | SPI1-HOLD<DBI-DCX/DBI-WRX> | UART2-TX    | SIM-CLK      | UART1-CTS                         | TWI1-SDA     | LCD-D21   | PA-EINT15   |
| PA16                   | GPIOA      | I/O     | TWI0-SCL                          | OWA-IN                     | TWI1-SCL    | UART0-TX     | IR-RX                             | UART2-TX     | SWD-TMS   | PA-EINT16   |
| PA17                   | GPIOA      | I/O     | TWI0-SDA                          | OWA-OUT                    | TWI1-SDA    | UART0-RX     | IR-TX                             | UART2-RX     | SWD-TCK   | PA-EINT17   |
| PA18/WUPIO4            | GPIOA      | I/O     | I2S-MCLK                          | IR-RX                      | IR-TX       |              | SPI1-MOSI<DBI-SDO>                | NCSI-HSYNC   | LCD-VSYNC | PA-EINT18   |
| PA19/WUPIO5            | GPIOA      | I/O     | I2S-LRCLK                         | UART1-RTS                  | PWM4        | DMIC-DATA0   | SPI1-HOLD<DBI-DCX/DBI-WRX>        | NCSI-VSYNC   | LCD-HSYNC | PA-EINT19   |
| PA20/WUPIO6            | GPIOA      | I/O     | I2S-BCLK                          | UART1-CTS                  | PWM5        | DMIC-DATA1   | SPI1-WP<DBI-TE>                   | NCSI-PCLK    | LCD-CLK   | PA-EINT20   |
| PA21/WUPIO7            | GPIOA      | I/O     | I2S-DIN                           | UART1-RX                   | PWM6        | DMIC-DATA2   | SPI1-MISO<DBI-SDI/DBI-TE/DBI-DCX> | NCSI-MCLK    | LCD-DE    | PA-EINT21   |
| PA22/WUPIO8            | GPIOA      | I/O     | I2S-DOUT                          | UART1-TX                   | PWM7        | DMIC-DATA3   |                                   | LEDC         | NCSI-D0   | PA-EINT22   |
| PA23/WUPIO9            | GPIOA      | I/O     | I2S-MCLK                          | DCXO-PUP-OUT               | SWD-SWO     | DMIC-CLK     | TWI0-SCL                          | PWM0         | NCSI-D1   | PA-EINT23   |
| PA24                   | GPIOA      | I/O     | SDC-DATA3                         | SPI0-MISO                  | PWM4        | UART2-RX     | TWI0-SDA                          | SIM-DATA     | NCSI-D6   | PA-EINT24   |
| PA25                   | GPIOA      | I/O     | SDC-CMD                           | SPI0-WP                    | PWM5        | JTAG-M33-TDO | JTAG-RV-TDO                       | SIM-CLK      | NCSI-D5   | PA-EINT25   |
| PA26                   | GPIOA      | I/O     | SDC-DATA0                         | SPI0-CLK                   | PWM6        | JTAG-M33-TDI | JTAG-RV-TDI                       | LEDC         | NCSI-D3   | PA-EINT26   |
| PA27                   | GPIOA      | I/O     | SDC-DATA1                         | SPI0-HOLD                  | PWM7        | JTAG-M33-TMS | JTAG-RV-TMS                       | SIM-DET      | NCSI-D2   | PA-EINT27   |
| PA28                   | GPIOA      | I/O     | SDC-DATA2                         | SPI0-CS                    | FEM-CTRL1   | JTAG-M33-TCK | JTAG-RV-TCK                       | SIM-RST      | NCSI-D7   | PA-EINT28   |
| PA29                   | GPIOA      | I/O     | SDC-CLK                           | SPI0-MOSI                  | FEM-CTRL2   | UART2-TX     | PWM1                              | LEDC         | NCSI-D4   | PA-EINT29   |

### For R128-S1/S2

| PB0/ADC0  | GPIOB | I/O  | UART0-TX | TWI1-SCL                          | IR-RX    | UART2-RTS | PWM2     |           | NCSI-HSYNC | PB-EINT0  |
| --------- | ----- | ---- | -------- | --------------------------------- | -------- | --------- | -------- | --------- | ---------- | --------- |
| PB1/ADC1  | GPIOB | I/O  | UART0-RX | TWI1-SDA                          | IR-TX    | UART2-CTS | PWM3     |           | NCSI-VSYNC | PB-EINT1  |
| PB2/ADC2  | GPIOB | I/O  | PWM2     | SPI1-MISO<DBI-SDI/DBI-TE/DBI-DCX> | TWI1-SCL | SIM-RST   | UART1-RX | UART2-RTS | LCD-D23    | PB-EINT2  |
| PB3/ADC3  | GPIOB | I/O  | PWM3     | SPI1-WP<DBI-TE>                   | TWI1-SDA | SIM-DET   | UART1-TX | UART2-CTS | LCD-D22    | PB-EINT3  |
| PB4/ADC4  | GPIOB | I/O  |          |                                   |          |           | PWM4     |           | LCD-DE     | PB-EINT4  |
| PB14/ADC6 | GPIOB | I/O  | UART1-TX |                                   |          |           |          |           | NCSI-PCLK  | PB-EINT14 |
| PB15/ADC7 | GPIOB | I/O  | UART1-RX |                                   |          |           | PWM0     |           | NCSI-MCLK  | PB-EINT15 |

### For R128-S3

| PB0/ADC0  | GPIOB | I/O  | UART0-TX  | TWI1-SCL                          | IR-RX     | UART2-RTS | PWM2     |           | NCSI-HSYNC | PB-EINT0  |
| --------- | ----- | ---- | --------- | --------------------------------- | --------- | --------- | -------- | --------- | ---------- | --------- |
| PB1/ADC1  | GPIOB | I/O  | UART0-RX  | TWI1-SDA                          | IR-TX     | UART2-CTS | PWM3     |           | NCSI-VSYNC | PB-EINT1  |
| PB2/ADC2  | GPIOB | I/O  | PWM2      | SPI1-MISO<DBI-SDI/DBI-TE/DBI-DCX> | TWI1-SCL  | SIM-RST   | UART1-RX | UART2-RTS | LCD-D23    | PB-EINT2  |
| PB3/ADC3  | GPIOB | I/O  | PWM3      | SPI1-WP<DBI-TE>                   | TWI1-SDA  | SIM-DET   | UART1-TX | UART2-CTS | LCD-D22    | PB-EINT3  |
| PB4/ADC4  | GPIOB | I/O  | UART1-RTS | SDC-CLK                           | SPI0-CS   |           | PWM4     |           | LCD-DE     | PB-EINT4  |
| PB5/ADC5  | GPIOB | I/O  | UART1-CTS | SDC-DATA1                         | SPI0-MOSI |           | PWM5     |           |            | PB-EINT5  |
| PB6       | GPIOB | I/O  | UART1-TX  | SDC-DATA0                         | SPI0-CLK  |           | PWM6     |           |            | PB-EINT6  |
| PB7       | GPIOB | I/O  | UART1-RX  | SDC-DATA3                         | SPI0-HOLD |           | PWM7     |           |            | PB-EINT7  |
| PB14/ADC6 | GPIOB | I/O  | UART1-TX  | SDC-DATA2                         | SPI0-WP   |           |          |           | NCSI-PCLK  | PB-EINT14 |
| PB15/ADC7 | GPIOB | I/O  | UART1-RX  | SDC-CMD                           | SPI0-MISO |           | PWM0     |           | NCSI-MCLK  | PB-EINT15 |


## 信号描述

| Signal Name                                                  | Description                                                  | Type  |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ----- |
| HS-PSRAM PHY IO                                              |                                                              |       |
| VDD12-PSM                                                    | Power Supply of PSRAM                                        | P     |
| RF0                                                          |                                                              |       |
| ANT0                                                         | Antenna of RF0                                               | A     |
| HXTAL-IN                                                     | Digital Compensated Crystal Oscillator Input                 | AI    |
| HXTAL-OUT                                                    | Digital Compensated Crystal Oscillator Output                | AO    |
| VCC33-RFPA0                                                  | Power Supply of RF0 Input                                    | P     |
| VCC18-TX0                                                    | Power Supply of RF0 Input                                    | P     |
| VCC18-ANA0                                                   | Power Supply of RF0 Analog/RF Input                          | P     |
| Note: HXTAL is the system clock of the whole chip, which includes the clocks required by the RF module and other modules. |                                                              |       |
| RF1                                                          |                                                              |       |
| ANT1                                                         | Antenna of RF1                                               | A     |
| VCC33-RFPA1                                                  | Power Supply of RF1 Input                                    | P     |
| VDD18-TX1                                                    | Power Supply of RF1 Input                                    | P     |
| VCC18-ANA1                                                   | Power Supply of RF1 Analog/RF Input                          | P     |
| PMU                                                          |                                                              |       |
| VIN-VBAT                                                     | VBAT System Power Input                                      | P     |
| VDD-RTC                                                      | RTC Power                                                    | P     |
| VDD-AON                                                      | VDD-AON Power Supply of AON Domain                           | P     |
| VDD-DSP                                                      | VDD-DSP Power Supply of DSP                                  | P     |
| LX                                                           | Power Supply of DCDC Output                                  | P     |
| EXT-LDO33                                                    | VDD-3V3 Power Output of 3.3V                                 | P     |
| VDD-SENSE                                                    | Power Supply of Internal LDO Input                           | P     |
| VDD-SYS                                                      | Power Supply for System                                      | P     |
| RESET                                                        |                                                              |       |
| CHIP-PWD                                                     | System Power on Reset                                        | I     |
| RSTN                                                         | System Reset                                                 | I     |
| USB                                                          |                                                              |       |
| VC33-USB                                                     | Power Supply of USB                                          | P     |
| USB-DM                                                       | USB Data Signal DM                                           | A I/O |
| USB-DP                                                       | USB Data Signal DP                                           | A I/O |
| Audio Codec                                                  |                                                              |       |
| MBIAS                                                        | Master Analog Microphone Bias Voltage Output                 | AO    |
| MICIN1P                                                      | Microphone Positive Input 1                                  | AI    |
| MICIN1N                                                      | Microphone Negative Input 1                                  | AI    |
| MICIN2P                                                      | Microphone Positive Input 2                                  | AI    |
| MICIN2N                                                      | Microphone Negative Input 2                                  | AI    |
| MICIN3P                                                      | Microphone Positive Input 3                                  | AI    |
| MICIN3N                                                      | Microphone Negative Input 3                                  | AI    |
| VRA1                                                         | Reference Voltage                                            | AO    |
| VRA2                                                         | Reference Voltage                                            | AO    |
| AGND                                                         | Analog Ground                                                | G     |
| AVCC                                                         | Power Supply for Analog Part                                 | P     |
| LOUTRN                                                       | Stereo Lineout Output Right Negative Channel                 | AO    |
| LOUTRP                                                       | Stereo Lineout Output Right Positive Channel                 | AO    |
| LOUTLP                                                       | Stereo Lineout Output Left Positive Channel                  | AO    |
| LOUTLN                                                       | Stereo Lineout Output Left Negative Channel                  | AO    |
| Power                                                        |                                                              |       |
| VCC-IO1                                                      | Power Supply of IO1 Domain                                   | P     |
| VCC-IO2                                                      | Power Supply of IO2 Domain                                   | P     |
| CIR Receiver                                                 |                                                              |       |
| IR-RX                                                        | Consumer Infrared Receiver                                   | I/O   |
| CIR Transmitter                                              |                                                              |       |
| IR-TX                                                        | Consumer Infrared Transmitter                                | I/O   |
| SPI                                                          |                                                              |       |
| SPI0-CS                                                      | SPI0 Chip Select Signal, Low Active                          | I/O   |
| SPI0-CLK                                                     | SPI0 Clock Signal                                            | I/O   |
| SPI0-MOSI                                                    | SPI0 Master Data Out, Slave Data In                          | I/O   |
| SPI0-MISO                                                    | SPI0 Master Data In, Slave Data Out                          | I/O   |
| SPI0-WP                                                      | SPI0 Write Protect, Low Active                               | I/O   |
| SPI0-HOLD                                                    | SPI0 Hold Signal                                             | I/O   |
| SPI1-CS<DBI-CSX>                                             | SPI1 Chip Select Signal, Low Active/Chip Select Signal, Low Active | I/O   |
| SPI1-CLK<DBI-SCLK>                                           | SPI1 Clock Signal/Serial Clock Signal                        | I/O   |
| SPI1-MOSI<DBI-SDO>                                           | SPI1 Master Data Out, Slave Data In/Data Output Signal       | I/O   |
| SPI1-MISO<DBI-SDI/DBI-TE/DBI-DCX>                            | SPI1 Master Data In, Slave Data Out/Data Input Signal/Tearing Effect Input/DCX pin is the select output signal of data and command | I/O   |
| SPI1-HOLD<DBI-DCX/DBI-WRX>                                   | SPI1 Hold Signal/ DCX pin is the select output signal of data and command/When DBI operates in dual data lane format, the RGB666 format 2 can use WRX to transfer data | I/O   |
| SPI1-WP<DBI-TE>                                              | SPI1 Write Protect, Low Active/ Tearing Effect Input         | I/O   |
| UART                                                         |                                                              |       |
| UART0-RX                                                     | UART0 Data Receive                                           | I/O   |
| UART0-TX                                                     | UART0 Data Transmit                                          | I/O   |
| UART1-RTS                                                    | UART1 Data Request to Send                                   | I/O   |
| UART1-CTS                                                    | UART1 Data Clear to Send                                     | I/O   |
| UART1-RX                                                     | UART1 Data Receive                                           | I/O   |
| UART1-TX                                                     | UART1 Data Transmit                                          | I/O   |
| UART2-RTS                                                    | UART2 Data Request to Send                                   | I/O   |
| UART2-CTS                                                    | UART2 Data Clear to Send                                     | I/O   |
| UART2-RX                                                     | UART2 Data Receive                                           | I/O   |
| UART2-TX                                                     | UART2 Data Transmit                                          | I/O   |
| PWM                                                          |                                                              |       |
| PWM[7:0]                                                     | Pulse Width Modulation Output Channel0                       | I/O   |
| TWI                                                          |                                                              |       |
| TWI0-SCL                                                     | TWI0 Serial CLOCK Signal                                     | I/O   |
| TWI0-SDA                                                     | TWI0 Serial Data Signal                                      | I/O   |
| TWI1-SCL                                                     | TWI1 Serial CLOCK Signal                                     | I/O   |
| TWI1-SDA                                                     | TWI1 Serial Data Signal                                      | I/O   |
| I2S                                                          |                                                              |       |
| I2S-LRCLK                                                    | I2S sample rate clock                                        | I/O   |
| I2S-BCLK                                                     | I2S Bit Rate Clock                                           | I/O   |
| I2S-DIN                                                      | I2S Serial Data Input                                        | I/O   |
| I2S-DOUT                                                     | I2S Serial Data Input                                        | I/O   |
| I2S-MCLK                                                     | I2S Master Clock                                             | I/O   |
| SDIO                                                         |                                                              |       |
| SDC-CMD                                                      | SDIO Command Signal                                          | I/O   |
| SDC-DATA[3:0]                                                | SDIO data Signal                                             | I/O   |
| SDC-CLK                                                      | SDIO clock Signal                                            | I/O   |
| DMIC                                                         |                                                              |       |
| DMIC-DATA[3:0]                                               | Digital MIC Data input signal                                | I/O   |
| DMIC-CLK                                                     | Digital Microphone Clock Output                              | I/O   |
| OWA                                                          |                                                              |       |
| OWA-IN                                                       | One Wire Audio Input                                         | I/O   |
| OWA-OUT                                                      | One Wire Audio Output                                        | I/O   |
| JTAG                                                         |                                                              |       |
| JTAG-RV-TMS                                                  | RISC-V JTAG TMS signal                                       | I/O   |
| JTAG-DSP-TMS                                                 | DSP JTAG TMS signal                                          | I/O   |
| JTAG-RV-TDI                                                  | RISC-V JTAG TDI signal                                       | I/O   |
| JTAG-DSP-TDI                                                 | DSP JTAG TDI signal                                          | I/O   |
| JTAG-RV-TDO                                                  | RISC-V JTAG TDO signal                                       | I/O   |
| JTAG-DSP-TDO                                                 | DSP JTAG TDO signal                                          | I/O   |
| JTAG-RV-TCK                                                  | RISC-V JTAG TCK signal                                       | I/O   |
| JTAG-DSP-TCK                                                 | DSP JTAG TDO signal                                          | I/O   |
| JTAG-M-TDO                                                   | ARM M33 JTAG TDO signal                                      | I/O   |
| JTAG-M-TDI                                                   | ARM M33 JTAG TDI signal                                      | I/O   |
| JTAG-M-TMS                                                   | ARM M33 JTAG TMS signal                                      | I/O   |
| JTAG-M-TCK                                                   | ARM M33 JTAG TCK signal                                      | I/O   |
| SWD                                                          |                                                              |       |
| SWD-SWO                                                      | Serial Wire Debug data signal                                | I/O   |
| SWD-TMS                                                      | Serial Wire Debug TMS signal                                 | I/O   |
| SWD-TCK                                                      | Serial Wire Debug clock signal                               | I/O   |
| System                                                       |                                                              |       |
| FEM-CTRL1                                                    | Front End Module Control, TX-EN                              | I/O   |
| FEM-CTRL2                                                    | Front End Module Control, RX-EN                              | I/O   |
| SIM-DATA                                                     | Smart Card data signal                                       | I/O   |
| SIM-CLK                                                      | Smart Card clock signal                                      | I/O   |
| SIM-DET                                                      | Smart Card detect signal                                     | I/O   |
| SIM-RST                                                      | Smart Card reset signal                                      | I/O   |
| DCXO                                                         |                                                              |       |
| DCXO-PUP-OUT                                                 | Power Control of External DCDC                               | I/O   |
| LEDC                                                         |                                                              |       |
| LEDC                                                         | Intelligent control LED signal output                        | I/O   |
| CLOCK                                                        |                                                              |       |
| 32KOSCO                                                      | 32.768K clock fanout                                         | I/O   |
| LCD                                                          |                                                              |       |
| LCD-VSYNC                                                    | LCD Vertical Sync                                            | I/O   |
| LCD-D[7:2]                                                   | LCD Data Output                                              | I/O   |
| LCD-D[15:10]                                                 | LCD Data Output                                              | I/O   |
| LCD-D[23:18]                                                 | LCD Data Output                                              | I/O   |
| LCD-CLK                                                      | LCD CLOCK                                                    | I/O   |
| LCD-HSYNC                                                    | LCD Horizontal Sync                                          | I/O   |
| LCD-DE                                                       | LCD Data Output Enable                                       | I/O   |
| NCSI                                                         |                                                              |       |
| NCSI-HSYNC                                                   | DVP-CSI Horizontal Sync signal                               | I/O   |
| NCSI-VSYNC                                                   | DVP-CSI Vertical Sync signal                                 | I/O   |
| NCSI-PCLK                                                    | DVP-CSI pixel clock signal                                   | I/O   |
| NCSI-MCLK                                                    | DVP-CSI master clock signal                                  | I/O   |
| NCSI-D[7:0]                                                  | DVP-CSI data signal[7:0]                                     | I/O   |
| Interrupt                                                    |                                                              |       |
| PA_EINT[29:0]                                                | GPIO A Interrupt                                             | I/O   |
| PB_EINT[4:0]                                                 | GPIO B Interrupt                                             | I/O   |
| PB_EINT[15:14]                                               | GPIO B Interrupt                                             | I/O   |

## R128-S1/R128-S2 与 R128-S3 的引脚区别

| Ball Number | R128-S1/R128-S2 Pin | R128-S3 Pin |
| ----------- | ------------------- | ----------- |
| 19          | RSTN                | VIN-VBAT    |
| 20          | VIN-VBAT            | LX          |
| 21          | LX                  | VDD-SENSE   |
| 22          | VDD-SENSE           | VCC33-USB   |
| 23          | VCC33-USB           | USB-DM      |
| 24          | USB-DM              | USB-DP      |
| 25          | USB-DP              | VDD-SYS     |
| 26          | VDD-SYS             | VDD12-PSM   |
| 27          | VDD12-PSM           | PA16        |
| 28          | PA16                | PA17        |
| 29          | PA17                | PA15        |
| 30          | PA15                | PA27        |
| 31          | PA27                | PA26        |
| 32          | PA26                | PA29        |
| 33          | PA29                | PA25        |
| 34          | PA25                | PA24        |
| 35          | PA24                | PA28        |
| 36          | PA28                | PB7         |
| 39          | PB14/ADC6           | PB6         |
| 40          | PB15/ADC7           | PB5/ADC5    |
| 41          | PB1/ADC1            | PB14/ADC6   |
| 42          | PB0/ADC0            | PB15/ADC7   |
| 43          | PB4/ADC4            | PB0/ADC0    |
| 44          | VDD-SYS             | PB1/ADC1    |
| 45          | VCC-IO1             | PB4/ADC4    |
| 46          | MBIAS               | VDD-SYS     |
| 47          | MICIN1P             | VCC-IO1     |
| 48          | MICIN1N             | MBIAS       |
| 49          | MICIN2P             | MICIN1P     |
| 50          | MICIN2N             | MICIN1N     |
| 51          | MICIN3P             | MICIN2P     |
| 52          | MICIN3N             | MICIN2N     |
| 53          | VRA1                | MICIN3P     |
| 54          | VRA2                | MICIN3N     |
| 55          | AGND                | VRA1        |
| 56          | AVCC                | VRA2        |
| 57          | LOUTLN              | AGND        |
| 58          | LOUTLP              | AVCC        |
| 59          | LOUTRP              | LOUTLN      |
| 60          | LOUTRN              | LOUTLP      |
