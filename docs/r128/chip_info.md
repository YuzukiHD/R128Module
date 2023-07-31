# 芯片参数

## 芯片特性

- **CPU Architecture**
  - XuanTie C906 64-bit RISC-V CPU up to 480 MHz 
    - 32 KB I-cache + 32 KB D-cache

  - ARM Cortex M33 Star@192 MHz MCU 
    - 32 KB I-cache + 32 KB D-cache
    - TrustZone 
- **DSP Architecture**
  - HiFi5 Audio DSP@400 MHz 
    - 32 KB I-cache + 32 KB D-cache 
- **Memory Subsystem**
  - **Boot ROM (BROM)**
    - On chip memory

    - Supports system boot from the following devic es:
      - SD/ eM MC

      - SPI Nor Flash

      - SPI Na nd Flash

    - Supports se cure boot and normal boot

    - Secure BROM supports load only certified firmware

    - Secure BROM e nsures that the secure boot is a trusted environment

    - Support USB eFEX protocol and UART mboot protocol for firmware upgrade

  - **PSRAMC** 
    - Up to 2 PSRAM controllers (HS_PSRAMC, LS_PSRAMC) 
    - HS_PSRAMC:
      - R128-S1/R128-S2: SIP 8 MB PSRAM
      - R128-S3: SIP 32 MB PSRAM
      - Supports AP memory PSRAM 
      - Supports 64 Mbit/256 Mbit PSRAM 
      - Supports OPI as the interface of PSRAM 
      - Supports the auto-refreshing and self-refreshing of PSRAM 
      - Supports up to 800 MHz PSRAM. The ratio of PSRAM controller and PSRAM clock is 1:4. 
      - Supports indirectly accessing the registers of PSRAM through interface configuration 
      - Supports caching reading/writing commands through CAM 
      - Supports out-of-order execution of commands 
      - Supports prefetching read passage 

    - LS_PSRAMC:
      - 8 MB OPI PSRAM for R128-S2 
      - Supports any frequency ratio of AHB and OPI clock 
      - Supports CPU/DMA to operate PSRAM through SBUS 
      - Supports PSRAM Wrap Mode (enter/exit) 
      - Supports APmemory APS3208 and APS6408 and Winbond W95*8 
      - Supports 4 offset address ranges 
      - Supports CBUS out-of-order reading/writing and XIP code execution 
  - **SMHC** 
    - Compatible with Secure Digital Memory (SD mem-version 2.0) 
    - Compatible with Secure Digital I/O (SDIO-version 3.0) 
    - Compatible with embedded MultiMediaCard (eMMC-version 5.0) 
    - Supports Card insertion and removal interrupt 
    - Supports hardware CRC generation and error detection 
    - Supports programmable baud rate 
    - Supports SDIO interrupts in 1-bit and 4-bit modes 
    - Supports block size of 1 to 65535 bytes 
    - Supports descriptor-based internal DMA controller 
    - Internal 1024-Bytes RX FIFO and 1024-Bytes TX FIFO 
    - Supports 1-bit, 4-bit SD and SDIO data bus width 
    - Supports 1-bit, 4-bit eMMC data bus width 
  - **Flash Controller & Flash Encryption**
    - Supports arbitrary frequency ratio of AHB clock and SPI clock 
    - Supports 4 segments of offset address range 
    - Supports receiving and transmitting in 1/2/4-wire SPI 
    - Supports flash programing and reading by configuring registers (SBUS) 
    - Supports out-of-order reading CBUS and running codes through XIP 
    - Supports continuous reading mode (enter/exit) and wrap mode (enter/exit) 
    - Supports the basic operation of SPI flash 
    - Supports 8 Mb SIP Nor Flash (for R128-S1) and 16 Mb SIP Nor Flash (for R128-S2) 
    - Supports real-time AES encoding and decoding when reading and writing data through SBUS data andreading data through CBUS

- **System**
  - **PMU** 
    - Supports 3.0 V-5 V external single supply
    - Integrates DCDC/LDO and other power modules, and power all circuits within the IC
    - The internal digital circuit is divided into power domains. Each of them has independent power switch,which is determined by system low-power status.
    - Supports standby, hibernation and other low-power modes, which can be switched over by PMU.
    - Manages the opening and close of analog modules like DCDC/LDO, DCXO/DPLL. The starting duration is configured by the software.
  - **GPRCM** 
    - Manages the power of this system
    - Manages the reset of each system
    - Manages the OSC clock
  - **CCU**
    - Up to 2 CCU controllers (CCU, CCU_AON)
    - CCU: 
      - Supports configuring module clock
      - Supports clock output control
      - Supports bus clock gating
      - Supports bus software reset

    - CCU_AON: 
      - Supports managing the OSC clock
      - Supports bus source and divisions
      - Supports configuring modules clock
      - Supports clock output control
      - Supports bus clock gating
      - Supports bus software reset
  - **DMAC**
    - Up to 2 DMACs 
    - Up to 16 DMA channels 
    - Provides 32 peripheral DMA requests for data reading and 32 peripheral DMA requests for data writing
    - Supports transferring data with a linked list 
    - Supports programmable 8-bit, 16-bit, 32-bit, and 64-bit data width 
    - Supports programmable DMA burst length 
    - DRQ response includes the waiting mode and handshake mode 
    - DMA channel support pause function 
    - Memory devices support non-aligned transfer 
  - **Timer** 
    - 8 timers: 5 for SW domain and 3 for AON domain 
    - Configurable counting clock: LOSC and OSC40M. Whether LOSC is internal low-frequency clock or external low-frequency clock (with greater accuracy) depends on LOSC_SRC_SEL. 
    - Supports 8 prescale factors 
    - Programmable 32-bit down timer 
    - Supports two timing modes: periodic mode and single counting mode 
    - Generates an interrupt when the count is decreased to 0 
  - **Watchdog** 
    - Up to 4 watchdogs, and one of them is secure world watchdog 
    - HOSC_32K clock sources and 32K system 
    - Supports 12 configurable initial count value 
    - Supports generating timeout interrupt 
    - Supports outputting reset signal 
    - Supports restarting timer 
  - **RTC** 
    - Implements time counter and timing wakeup 
    - Provides counters for counting year, month, day, hour, minute, and second 
    - 4-channel clock sources: hosc_32K, rccal_32K, rcosc, losc_clk 
    - Configures initial value by software anytime 
    - Supports timing alarm, and generates interrupt and wakes up the PMU system 
  - **Message Box**
    - Supports 3 CPU to transmit information through channels. Each CPU has a MSGBOX. 
      - CPU0: ARM CPU 
      - CPU1: RISC-V 
      - CPU2: DSP

    - There are four channels every two CPU, and the FIFO depth of one channel is 8 x 32 bits. 
    - Supports interrupts 
  - **Spinlock** 
    - Supports 32 lock units 
    - Two kinds of lock status: locked and unlocked 
    - Lock time of the processor is predictable (less than 200 cycles) 
- **Video and Graphics** 
  - **DE**
    - Supports output size up to 1024x1024 pixels 
    - Supports two alpha blending UI channels for main display 
    - Supports four overlay layers in each channel, and channel0 has an independent scaler 
    - Supports potter-duff compatible blending operation 
    - Supports input format ARGB8888/XRGB8888/RGB888/ARGB4444/ARGB1555/RGB565 
    - Supports SmartColor2.0 for excellent display experience 
      - Fully programmable color matrix 
      - Dynamic gamma 
    - Supports write back only for verification 
  - **G2D** 
    - Supports layer size up to 1024x1024 pixels 
    - Supports pre-multiply alpha image data 
    - Supports color key 
    - Supports two pipes Porter-Duff alpha blending 
    - Supports multiple video formats 4:2: 0, 4:2:2, 4:1:1 and multiple pixel formats (8/16/24/32 bits graphics layer) 
    - Supports any format convert function above 
    - Supports 1/16× to 32× resize ratio
    - Supports 32-phase 8-tap horizontal anti-alias filter and 32-phase 4-tap vertical anti-alias filter. 
    - Supports window clip 
    - Supports FillRectangle, BitBlit, StretchBlit and MaskBlit 
    - Supports horizontal and vertical flip, clockwise 0/90/180/270 degree rotate for normal buffer 
- **Video Input Interfaces**
  - **CSI & JPEG** 
    - CSI:
      - Supports YUV422 format input and YUV420 format NV12 output 
      - Supports scaling image down 1/2 and cropwin 
      - Supports receiving JPEG streams directly output by sensor 
      - Supports receiving the images with unconventional resolutions (X and Y can be an integer multiple of 16, such as: 192\*192, 304\*224) 
      - Supports receiving the images with conventional resolutions (such as 128\*128, 256\*256, 320\*240, 640\*480, 1280\*720, 1920\*1088) 
    - JPEG: 
      - Supports 640\*480@60fps in the online mode, and 640\*480@30fps in the offline mode 
      - Supports 1280\*720@40fps in the online mode, and 1280\*720@20fps in the offline mode 
      - Supports up to 1920\*1088 online/offline encoding 
      - Supports encoding after scaling images down 1/2 and cropwin 
      - Supports block output in the online mode to reduce SRAM usage and improve bandwidth utilization ratio 
      - Supports online/offline encoding (such as 192\*192 and 304\*224) the images with non-conventional resolution 
      - Supports the online/offline encoding the images with conventional resolution images 
- **Video Output Interfaces** 

  -  **TCON_LCD** 
     - Supports RGB interface with DE/SYNC mode, up to 1024x768@60fps 
     - Supports serial RGB/dummy RGB interface, up to 800x480@60fps 
     - Supports i8080 interface, up to 800x480@60fps 
     - Supports BT656 interface for NTSC and PAL 
     - Supports RGB666 and RGB565 with dither function
  -  **SPI DBI**
     -  Supports DBI Type C 3 Line/4 Line Interface Mode 
     -  Supports 2 Data Lane Interface Mode 
     -  Supports data source from CPU or DMA 
     -  Supports RGB111/444/565/666/888 video format 
     -  Maximum resolution of RGB666 240 x 320@30Hz with single data lane 
     -  Maximum resolution of RGB888 240 x 320@60Hz or 320 x 480@30Hz with dual data lane 
     -  Supports tearing effect 
     -  Supports software flexible control video frame rate 
- **Audio Interfaces** 

  - **Audio Codec** 

    - HiFi Audio ADC 
      - 3-channel ADCs @ 24-bit 
      - Up to 95 dB SNR during ADC recording path (signal through PGA and ADC with A-weighted filter) 
      - 3 fully-differential analog microphone inputs with 0 dB~30 dB amplifier gain 
      - Supports sample rates ranging from 8 kHz to 96 kHz 
      - Digital volume control with 0.5 dB step 
      - Digital high-pass filter 
      - 128x24-bit FIFO for recording received data 
    - HiFi Audio DAC 

      - 2-channel DACs @ 24-bit (for R128-S1 and R128-S2) 
      - 1-channel DAC @ 24-bit (for R128-S3) 
      - Up to 105 dB SNR in the DAC playback path (signal through DAC and lineout with A-weighted filter) 
      - Supports sample rates ranging from 8 kHz to 384 kHz 
      - Digital volume control with 0.5 dB step 
      - 20-band Biquads filter for EQ 
      - 3-band dynamic range control 
      - 128x24-bit FIFO for playing transmitted data
      - Three differential microphone inputs: MICIN1P/N, MICIN2P/N, MICIN3P/N. 
      - Two stereo LINEOUT outputs: LINEOUTLP/N and LINEOUTRP/N (for R128 S1 and R128 S2) 
      - One single-end LINEOUT output: LINEOUTLP/N (for R128 S3) 
      - Built-in audio PLL with flexible clocking scheme 
      - DMA and interrupt support both receiving and transmitting 
      - Integrated ALDO for analog part 
      - One low-noise analog microphone bias output three audio inputs 
    - **I2S/PCM** 

      - Compliant with standard Philips Inter-IC sound (I2S) bus specification 
        - Left-justified, Right-justified, PCM mode, and TDM (Time Division Multiplexing) format 
        - Programmable PCM frame width: 1 BCLK width (short frame) and 2 BCLKs width (long frame) 
      - Transmit and Receive data FIFOs 
        - Programmable FIFO thresholds 
        - 128 depth x 32-bit width TXFIFO, 64 depth x 32-bit width RXFIFO 
      - Supports multiple function clock 
        - Clock up to 24.576MHz Data Output of I2S/PCM in Master mode (Only if the IO PAD and Peripheral I2S/PCM satisfy Timing Parameters) 
        - clock up to 12.288MHz Data Input of I2S/PCM in Master mode 
      - Supports TX/RX DMA Slave interface 
      - Supports Multiple application scenarios 
        - Up to 16 channel (fs = 48 kHz) which has adjustable width from 8-bit to 32-bit 
        - Sample rate from 8 kHz to 384 kHz (CHAN = 2) 
        - 8-bits u-law and 8-bits A-law companded sample 
      - Supports Master/Slave mode 
    - **DMIC** 
      - Supports up to 8 channels 
      - Sample rate from 8 kHz to 48 kHz 
    - **OWA**
      - In compliance with S/PDIF Interface 
      - Compatible with standard IEC-60958 and IEC-61937 
        - IEC-60958 supports 16-bit, 20-bit and 24-bit data formats 
        - IEC-61937 uses the IEC-60958 series for the conveying of non-linear PCM bit streams, each sub-frame transmits 16-bit 
      - TXFIFO and RXFIFO 
        - One 128×24bits TXFIFO and one 64×24bits RXFIFO for audio data transmission 
        - Programmable FIFO thresholds 
      - Supports TX/RX DMA slave interface
      - Supports multiple function clock 
        - Separate clock for OWA TX and OWA RX 
        - The clock of TX function includes a series of 24.576 MHz and 22.579 MHz frequency
        - The clock of RX function includes a series of 24.576\*8 MHz frequency (RX function clock 24.576\*8 MHz supports CDR of sample rate from 8 kHz to 192 kHz) 
      - Supports hardware parity on TX/RX
        - Hardware parity generation on the transmitter 
        - Hardware parity checking on the receiver 
      - Supports channel status capture for the receiver 
      - Supports channel sample rate capture on the receiver 
      - Supports insertion detection for the receiver 
      - Supports channel status insertion for the transmitter 
      - Supports interrupts and DMA 
- **Security Subsystem** 

  - **Crypto Engine** 
    - Supports Symmetrical Algorithm: AES, DES, 3DES 
    - Supports 128-bits, 192-bits and 256-bits key size for AES 
    - Supports ECB, CBC, CTR, CTS, OFB, CFB modes for AES 
    - Supports 1, 8, 64, 128bit width for AES-CFB 
    - Supports 16bit, 32bit, 64bit, 128bit wide size for AES CTR 
    - Supports ECB, CBC, CTR, CBC_MAC modes for DES/3DES 
    - Supports 16bit, 32bit, 64bit wide size for DES/3DES CTR 
    - Supports Hash Algorithms: MD5, SHA1, SHA224, SHA256, SHA384, SHA512, HMAC 
    - Supports multi-package mode for MD5, SHA1, SHA224, SHA256, SHA384, SHA512 
    - Supports Asymmetrical Algorithm: RSA512/1024/2048bit 
    - Supports internal DMA Controller for data transmission with memory 
    - Supports secure and non-secure interfaces respectively 
    - Supports accessing Secure and non-secure interfaces by non-secure host when secure_mode is 0 

  - **SMC** 
    - The SMC (GSecure Memory Control) is always secure, only secure CPU can access the SMC 
    - Sets secure area of HSPSRAM 
    - Sets secure property that Master accesses to HSPSRAM 

  - **SPC** 
    - The SPC (Secure Peripherals Control) is always secure, only secure CPU can access the SPC 
    - Sets secure property of peripherals 
    - Supports safety access of flash controller 
- **USB2.0 DRD** 

  - Complies with USB 2.0 Specification 
  - Supports High-Speed (HS, 480-Mbps), Full-Speed (FS, 12-Mbps), and Low-Speed (LS, 1.5-Mbps) in Host mode 
  - Supports High-Speed (HS, 480 Mbps), Full-Speed (FS, 12 Mbps) in Device mode 
  - Supports the UTMI+ Level 3 interface. The 8-bit bidirectional data buses are used 
  - Supports bi-directional endpoint0 for Control transfer 
  - Supports up to 8 User-Configurable Endpoints for Bulk, Isochronous and Interrupt bi-directional transfers (Endpoint1, Endpoint2, Endpoint3, Endpoint4) 
  - Supports up to (4KB+64Bytes) FIFO for EPs (Including EP0) 
  - Supports High-Bandwidth Isochronous & Interrupt transfers 
  - Automated splitting/combining of packets for Bulk transfers 
  - Supports point-to-point and point-to-multipoint transfer in both Host and Peripheral mode 
  - Includes automatic ping capabilities 
  - Soft connect/disconnect function 
  - Performs all transaction scheduling in hardware 
  - Power Optimization and Power Management capabilities 
  - Includes interface to an external Normal DMA controller for every Eps 
- **UART** 

  - Compatible with industry-standard 16450/16550 UARTs 
  - 64-Byte Transmit and receive data FIFOs 
  - Supports DMA controller interface 
  - Supports Software/ Hardware Flow Control 
  - Supports IrDA 1.0 SIR 
  - Supports RS-485 mode 
- **SPI** 

  - Up to 2 SPI controllers (SPI0, SPI1) 
  - The SPI0 only supports SPI mode. The SPI1 supports SPI mode and display bus interface (DBI) mode 
  - Full-duplex synchronous serial interface 
  - Master/slave configurable 
  - 8-bit wide by 64-entry FIFO for both transmitting and receiving data 
  - Polarity and phase of the Chip Select (SPI_SS) and SPI Clock (SPI_SCLK) are configurable 
  - Supports interrupts and DMA 
  - Supports mode0, mode1, mode2, and mode3 
  - Supports 3-wire/4-wire SPI 
  - Supports programmable serial data frame length: 0 bit to 32 bits 
  - Supports standard SPI, dual-output/dual-input SPI, dual I/O SPI, quad-output/quad-input SPI 
  - Supports maximum IO rate of the mass production: 100 MHz 
  - Supports 5 clock sources, Interrupt or DMA 
- **TWI** 

  - Supports 2 TWIs 
  - Software-programmable for Slave or Master 
  - Supports Repeated START signal 
  - Allows 10-bit addressing with TWI bus 
  - Performs arbitration and clock synchronization 
  - Owns address and General Call address detection 
  - Interrupt on address detection 
  - Supports speeds up to 400 kbits/s in fast mode 
  - Allows operation from a wide range of input clock frequencies 
  - TWI Driver Supportss packet transmission and DMA when TWI works in Master mode 
- **PWM** 

  - Supports 8 independent PWM channels (PWM0 to PWM7) 
    - Supports PWM continuous mode output 
    - Supports PWM pulse mode output, and the pulse number is configurable 
    - Output frequency range: 0 to 24 MHz or 0 to 100 MHz 
    - Various duty-cycle: 0% to 100% 
    - Minimum resolution: 1/65536 

  - Supports 4 complementary pairs output
    - PWM01 pair (PWM0 + PWM1), PWM23 pair (PWM2 + PWM3), PWM45 pair (PWM4 + PWM5), PWM67 pair (PWM6 + PWM7) 
    - Supports dead-zone generator, and the dead-zone time is configurable 

  - Supports 4 groups of PWM channel output for controlling stepping motors 
    - Supports any plural channels to form a group, and output the same duty-cycle pulse 
    - In group mode, the relative phase of the output waveform for each channel is configurable 

  - Supports 8 channels capture input 
    - Supports rising edge detection and falling edge detection for input waveform pulse
    - Supports pulse-width measurement for input waveform pulse 
- **GPADC** 

  - 12-bit Resolution and 10-bit effective SAR type A/D converter 
  - 9-channel multiplexer including 7 channels general purpose ADC (ADC0-ADC6) and 2 channels special ADC (ADC8, ADC12) for R128-S1 and R128-S2 
  - 10-channel multiplexer including 8 channels general purpose ADC (ADC0-ADC7) and 2 channels special 
  - ADC (ADC8, ADC12) for R128-S3 
  - The ADC8 is used for VBAT voltage detection and the ADC12 is used for temperature sensor 
  - 64 FIFO depth of data register 
  - Power Supply Voltage: 2.5V, Analog Input Range: 0 to 2.5V 
  - Maximum Sampling frequency: 1 MHz 
  - Support self-calibration 
  - Support data compare and interrupt 
  - Support four operation modes 
    - Single conversion mode
    - Single-cycle conversion mode 
    - Continuous conversion mode
    - Outbreak conversion mode 
- **CIR Receiver** 

  - Supports CIR remote control receiver 
  - Supports NEC IR protocol 
  - 64x8 bits RX FIFO for data buffer 
  - Programmable RX FIFO thresholds 
  - Supports interrupt 
  - Sample clock up to 1 MHz 
- **CIR Transmitter**

  - Supports CIR remote control transmitter 
  - 128 Bytes FIFO for data buffer 
  - Configurable carrier frequency 
  - Supports Interrupt and DMA 
  - Supports handshake mode and waiting mode of DMA
- **LEDC**

  - Configurable LED input high-/low-level width 
  - Configurable LED reset time 
  - LEDC data supports DMA configuration mode and CPU configuration mode 
  - Maximum 1024 LEDs serial connect 
  - LED data transmission rate up to 800 kbit/s 
  - Configurable RGB display mode 
  - Configurable default level of non-data output 
- **SCR** 

  - Supports the ISO/IEC 7816-3:1997(E) and EMV2000 (4.0) Specifications 
  - Performs functions needed for complete smart card sessions, including: 
    - Card activation and deactivation 
    - Cold/warm reset 
    - Answer to Reset (ATR) response reception 
    - Data transfers to and from the card 

  - Supports adjustable clock rate and bit rate 
  - Configurable automatic byte repetition 
  - Supports commonly used communication protocols: 
    - T=0 for asynchronous half-duplex character transmission
    - T=1 for asynchronous half-duplex block transmission 

  - 128bits FIFO for data transmit & receive 
  - Supports FIFOs for receive and transmit buffers (up to 128 bits) with threshold 
  - Supports configurable timing functions: 
    - Smart card activation time 
    - Smart card reset time
    - Guard time 
    - Timeout timers 

  - Supports synchronous and any other non-ISO 7816 and non-EMV cards 
- **Wi-Fi MAC** 

  - 802.11d: Regulatory domain operation 
  - 802.11e: QoS including WMM 
  - 802.11h: Transmit power control dynamic and frequency selection 
  - 802.11i: Security including WPA2 compliance
  - 802.11w: Supports STA Mode with PMF, SA Query, SAE 
  - **Wi-Fi Baseband** 
    - Compatible with IEEE 802.11 b/g/n standard on 2.4 GHz 
    - Up to 20 MHz bandwidth 
    - MCS0-7 data rate for 802.11n 
    - 6 MB-54MB data rate for 802.11g 
    - DSSS, CCK modulation with long and short preamble 
    - Short Guard Interval 
    - Long Guard Interval 
    - RX antenna Diversity 
    - Supports RX STBC 

  - **Wi-Fi Radio** 
    - Integrated 2.4GHz PA, LNA, and T/R switch 
    - Internal impedance matching network and harmonic filter allow chip to connect to antenna directly
    - High Power Amplifier with 3 V-5.5 V full range directly support XRADIOTECH's MPDTM technology ensure linearity tracking automatically to always keep EVM and mask within specifications 
    - Special Architecture and Device design to keep the reliability of PA and also deliver high output power (>25 dBm) 
- **Bluetooth Subsystem**
  - BLE V5.0 
    - Bluetooth 5.0 Dual Mode complies with V2.1/4.0/4.2/5.0" 
    - Supports GFSK, pi/4 DQPSK, and 8DPSK modulation 
    - Data rates support: 125Kbps, 500Kbps, 1Mbps, 2Mbps 
    - supports long range 
    - TRNG generator 
    - AES-128 data encryption with ECB and CCM mode 
    - Supports advertising extension 
    - Packet assembly and disassembly 
    - Data Whitening and De-whitening 
    - Data CRC generation and checking 
    - Packet filtering based on filter policies (white and resolving lists) 
    - Private address generation and Accelerate address resolution 
    - Access address generation and matching 
    - Frequency hopping and channel mapping 
    - RSSI Reporting to host

  - BR/EDR 
    - Adaptive Frequency Hopping 
    - SCO and eSCO support 
    - 1, 3 and 5 slots all packet types support 
    - Transcoders for A-law, µ-law and CVSD voice over air 
    - Supports piconet and scatternet 
    - Secure simple pairing 
    - Supports sniff/sniff subrating low power mode 
  - Transmits Power: -20 dBm (0.01 mW) to +10 dBm (10 mW) 
  - Receiver Sensitivity: 
    - 95.0 dBm@BR 
    - 98 dBm@BLE 1 Mbit/s 
    - 105 dBm@BLE S = 8 
- **Package** 
  - QFN80 balls, 0.35mm ball pitch, 8mm x 8mm body

## GPIO 复用

| Pin Name                                                     | GPIO Group | IO Type                           | Function 2                        | Function 3  | Function 4   | Function 5                        | Function6    | Function7  | Function8  | Function 14 |
| ------------------------------------------------------------ | ---------- | --------------------------------- | --------------------------------- | ----------- | ------------ | --------------------------------- | ------------ | ---------- | ---------- | ----------- |
| PA0                                                          | GPIOA      | I/O                               | IR-RX                             |             | PWM7         | TWI0-SCL                          | TWI1-SCL     | LCD-VSYNC  | LCD-D2     | PA-EINT0    |
| PA1/FEL0                                                     | I/O        | IR-TX                             | FEM-CTRL1                         | IR-RX       | TWI0-SDA     | TWI1-SDA                          |              | LCD-D3     | PA-EINT1   |             |
| PA2/FEL1                                                     | I/O        | SPI1-CS<DBI-CSX>                  | DMIC-DATA0                        | JTAG-RV-TMS | SDC-DATA1    | I2S-LRCLK                         | JTAG-DSP-TMS | LCD-D4     | PA-EINT2   |             |
| PA3                                                          | I/O        | SPI1-CLK<DBI-SCLK>                | DMIC-DATA1                        | JTAG-RV-TDI | SDC-DATA0    | I2S-BCLK                          | JTAG-DSP-TDI | LCD-D5     | PA-EINT3   |             |
| PA4                                                          | I/O        | SPI1-MOSI<DBI-SDO>                | DMIC-DATA2                        | UART0-TX    | SDC-CLK      | I2S-DIN                           | PWM1         | LCD-D6     | PA-EINT4   |             |
| PA5                                                          | I/O        | SPI1-MISO<DBI-SDI/DBI-TE/DBI-DCX> | DMIC-DATA3                        | JTAG-RV-TDO | SDC-CMD      | I2S-DOUT                          | JTAG-DSP-TDO | LCD-D7     | PA-EINT5   |             |
| PA6                                                          | I/O        | SPI1-HOLD<DBI-DCX/DBI-WRX>        | DMIC-CLK                          | UART0-RX    | SDC-DATA3    | I2S-MCLK                          | LCD-CLK      | LCD-D14    | PA-EINT6   |             |
| PA7                                                          | I/O        | SPI1-WP<DBI-TE>                   | OWA-IN                            | JTAG-RV-TCK | SDC-DATA2    | JTAG-DSP-TCK                      | LCD-HSYNC    | LCD-D13    | PA-EINT7   |             |
| PA8                                                          | I/O        | UART0-RX                          | OWA-OUT                           | PWM0        | OWA-IN       | TWI1-SCL                          | FEM-CTRL2    | LCD-D12    | PA-EINT8   |             |
| PA9                                                          | I/O        | UART0-TX                          |                                   | PWM1        | LEDC         | TWI1-SDA                          | LCD-DE       | LCD-D15    | PA-EINT9   |             |
| PA10                                                         | I/O        | UART2-RTS                         | IR-RX                             | PWM2        | TWI1-SCL     |                                   |              | LCD-D11    | PA-EINT10  |             |
| PA11/WUPIO0                                                  | I/O        | UART2-CTS                         | IR-TX                             | PWM3        | TWI1-SDA     | 32KOSCO                           | FEM-CTRL1    | LCD-D10    | PA-EINT11  |             |
| PA12/WUPIO1/ LXTAL-IN                                        | I/O        | UART2-TX                          | TWI0-SCL                          | UART2-RTS   | IR-RX        | SPI1-CS/DBI-CSX                   | LCD-VSYNC    | LCD-D18    | PA-EINT12  |             |
| PA13/WUPIO2/ LXTAL-OUT                                       | I/O        | UART2-RX                          | TWI0-SDA                          | UART2-CTS   | IR-TX        | SPI1-CLK/DBI-SCLK                 | LEDC         | LCD-D19    | PA-EINT13  |             |
| PA14/WUPIO3                                                  | I/O        | PWM0                              | SPI1-MOSI<DBI-SDO>                | UART2-RX    | SIM-DATA     | UART1-RTS                         | TWI1-SCL     | LCD-D20    | PA-EINT14  |             |
| PA15                                                         | I/O        | PWM1                              | SPI1-HOLD<DBI-DCX/DBI-WRX>        | UART2-TX    | SIM-CLK      | UART1-CTS                         | TWI1-SDA     | LCD-D21    | PA-EINT15  |             |
| PA16                                                         | I/O        | TWI0-SCL                          | OWA-IN                            | TWI1-SCL    | UART0-TX     | IR-RX                             | UART2-TX     | SWD-TMS    | PA-EINT16  |             |
| PA17                                                         | I/O        | TWI0-SDA                          | OWA-OUT                           | TWI1-SDA    | UART0-RX     | IR-TX                             | UART2-RX     | SWD-TCK    | PA-EINT17  |             |
| PA18/WUPIO4                                                  | I/O        | I2S-MCLK                          | IR-RX                             | IR-TX       |              | SPI1-MOSI<DBI-SDO>                | NCSI-HSYNC   | LCD-VSYNC  | PA-EINT18  |             |
| PA19/WUPIO5                                                  | I/O        | I2S-LRCLK                         | UART1-RTS                         | PWM4        | DMIC-DATA0   | SPI1-HOLD<DBI-DCX/DBI-WRX>        | NCSI-VSYNC   | LCD-HSYNC  | PA-EINT19  |             |
| PA20/WUPIO6                                                  | I/O        | I2S-BCLK                          | UART1-CTS                         | PWM5        | DMIC-DATA1   | SPI1-WP<DBI-TE>                   | NCSI-PCLK    | LCD-CLK    | PA-EINT20  |             |
| PA21/WUPIO7                                                  | I/O        | I2S-DIN                           | UART1-RX                          | PWM6        | DMIC-DATA2   | SPI1-MISO<DBI-SDI/DBI-TE/DBI-DCX> | NCSI-MCLK    | LCD-DE     | PA-EINT21  |             |
| PA22/WUPIO8                                                  | I/O        | I2S-DOUT                          | UART1-TX                          | PWM7        | DMIC-DATA3   |                                   | LEDC         | NCSI-D0    | PA-EINT22  |             |
| PA23/WUPIO9                                                  | I/O        | I2S-MCLK                          | DCXO-PUP-OUT                      | SWD-SWO     | DMIC-CLK     | TWI0-SCL                          | PWM0         | NCSI-D1    | PA-EINT23  |             |
| PA24                                                         | I/O        | SDC-DATA3                         | SPI0-MISO                         | PWM4        | UART2-RX     | TWI0-SDA                          | SIM-DATA     | NCSI-D6    | PA-EINT24  |             |
| PA25                                                         | I/O        | SDC-CMD                           | SPI0-WP                           | PWM5        | JTAG-M33-TDO | JTAG-RV-TDO                       | SIM-CLK      | NCSI-D5    | PA-EINT25  |             |
| PA26                                                         | I/O        | SDC-DATA0                         | SPI0-CLK                          | PWM6        | JTAG-M33-TDI | JTAG-RV-TDI                       | LEDC         | NCSI-D3    | PA-EINT26  |             |
| PA27                                                         | I/O        | SDC-DATA1                         | SPI0-HOLD                         | PWM7        | JTAG-M33-TMS | JTAG-RV-TMS                       | SIM-DET      | NCSI-D2    | PA-EINT27  |             |
| PA28                                                         | I/O        | SDC-DATA2                         | SPI0-CS                           | FEM-CTRL1   | JTAG-M33-TCK | JTAG-RV-TCK                       | SIM-RST      | NCSI-D7    | PA-EINT28  |             |
| PA29                                                         | I/O        | SDC-CLK                           | SPI0-MOSI                         | FEM-CTRL2   | UART2-TX     | PWM1                              | LEDC         | NCSI-D4    | PA-EINT29  |             |
| NOTE: LXTAL is the low-frequency clock exclusively for the RTC domain. |            |                                   |                                   |             |              |                                   |              |            |            |             |
| For R128-S1/S2                                               |            |                                   |                                   |             |              |                                   |              |            |            |             |
| PB0/ADC0                                                     | GPIOB      | I/O                               | UART0-TX                          | TWI1-SCL    | IR-RX        | UART2-RTS                         | PWM2         |            | NCSI-HSYNC | PB-EINT0    |
| PB1/ADC1                                                     | I/O        | UART0-RX                          | TWI1-SDA                          | IR-TX       | UART2-CTS    | PWM3                              |              | NCSI-VSYNC | PB-EINT1   |             |
| PB2/ADC2                                                     | I/O        | PWM2                              | SPI1-MISO<DBI-SDI/DBI-TE/DBI-DCX> | TWI1-SCL    | SIM-RST      | UART1-RX                          | UART2-RTS    | LCD-D23    | PB-EINT2   |             |
| PB3/ADC3                                                     | I/O        | PWM3                              | SPI1-WP<DBI-TE>                   | TWI1-SDA    | SIM-DET      | UART1-TX                          | UART2-CTS    | LCD-D22    | PB-EINT3   |             |
| PB4/ADC4                                                     | I/O        |                                   |                                   |             |              | PWM4                              |              | LCD-DE     | PB-EINT4   |             |
| PB14/ADC6                                                    | I/O        | UART1-TX                          |                                   |             |              |                                   |              | NCSI-PCLK  | PB-EINT14  |             |
| PB15/ADC7                                                    | I/O        | UART1-RX                          |                                   |             |              | PWM0                              |              | NCSI-MCLK  | PB-EINT15  |             |
| For R128-S3                                                  |            |                                   |                                   |             |              |                                   |              |            |            |             |
| PB0/ADC0                                                     | GPIOB      | I/O                               | UART0-TX                          | TWI1-SCL    | IR-RX        | UART2-RTS                         | PWM2         |            | NCSI-HSYNC | PB-EINT0    |
| PB1/ADC1                                                     | I/O        | UART0-RX                          | TWI1-SDA                          | IR-TX       | UART2-CTS    | PWM3                              |              | NCSI-VSYNC | PB-EINT1   |             |
| PB2/ADC2                                                     | I/O        | PWM2                              | SPI1-MISO<DBI-SDI/DBI-TE/DBI-DCX> | TWI1-SCL    | SIM-RST      | UART1-RX                          | UART2-RTS    | LCD-D23    | PB-EINT2   |             |
| PB3/ADC3                                                     | I/O        | PWM3                              | SPI1-WP<DBI-TE>                   | TWI1-SDA    | SIM-DET      | UART1-TX                          | UART2-CTS    | LCD-D22    | PB-EINT3   |             |
| PB4/ADC4                                                     | I/O        | UART1-RTS                         | SDC-CLK                           | SPI0-CS     |              | PWM4                              |              | LCD-DE     | PB-EINT4   |             |
| PB5/ADC5                                                     | I/O        | UART1-CTS                         | SDC-DATA1                         | SPI0-MOSI   |              | PWM5                              |              |            | PB-EINT5   |             |
| PB6                                                          | I/O        | UART1-TX                          | SDC-DATA0                         | SPI0-CLK    |              | PWM6                              |              |            | PB-EINT6   |             |
| PB7                                                          | I/O        | UART1-RX                          | SDC-DATA3                         | SPI0-HOLD   |              | PWM7                              |              |            | PB-EINT7   |             |
| PB14/ADC6                                                    | I/O        | UART1-TX                          | SDC-DATA2                         | SPI0-WP     |              |                                   |              | NCSI-PCLK  | PB-EINT14  |             |
| PB15/ADC7                                                    | I/O        | UART1-RX                          | SDC-CMD                           | SPI0-MISO   |              | PWM0                              |              | NCSI-MCLK  | PB-EINT15  |             |

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
