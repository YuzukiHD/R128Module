# 配置引脚复用

## 本文中的约定

- 描述 GPIO 配置的形式：`Port:端口 + 组内序号<功能分配><内部电阻状态><驱动能力><输出电平状态>`
- 文中的 `<X>=0,1,2,3,4,5…..`，如 twi0，twi1….；uart0，uart1….。
- 文中的 `{PROJECT}` 代表不同的方案，例如 `module` 方案。

## 引脚配置文件配置复用

R128 平台使用 `sys_config.fex` 作为引脚配置文件，他会在打包时打包编译进入系统，在系统运行时会解析并配置，系统解析 `sys_config.fex` 的驱动配置位于 `lichee\rtos-components\aw\sys_config_script` 中。

对于配置引脚复用，只需要修改  `board\r128s2\{PROJECT}\config\sys_config.fex`  文件即可。

### GPIO描述格式

```
Port:端口 + 组内序号<功能分配><内部电阻状态><驱动能力><输出电平状态>
```

示例

```ini
uart_tx = port:PA16<5><1><2><0>
                |----------------------> 端口号 PA
                  |--------------------> 序号 19
                    |------------------> 功能分配 5 （参考 PINMUX）
                       |---------------> 内部电阻状态为 1  
                          |------------> 驱动能力为 2
                             |---------> 默认输出电平 0
```

### [product]

配置文件信息

| 配置项  | 配置项含义   |
| ------- | ------------ |
| version | 配置的版本号 |
| machine | 方案名字     |

示例

```ini
[product]
version = "100"
machine = "module"
```

### [target]

启动介质配置


| 配置项       | 配置项含义                                                   |
| ------------ | ------------------------------------------------------------ |
| storage_type | 启动介质选择 <br />0:nand <br />1:sd<br />2:emmc<br />3:spinor <br />4:emmc <br />5:spinand <br />6:sd <br />-1:(defualt) 自动扫描启动介质 |

示例

```ini
[target]
storage_type    = 3
```

> 对于内置 SPI NOR 的 R128 平台，请配置为 `3`

### [platform]

配置 boot0 调试信息打印

| 配置项     | 配置项含义                                     |
| ---------- | ---------------------------------------------- |
| debug_mode | 配置0时，boot0 不打印调试信息，配置不为0时打印 |

示例

```ini
[platform]
debug_mode = 2
```

### [uart_para]

boot0 调试串口配置

| 配置项          | 配置项含义                     |
| --------------- | ------------------------------ |
| uart_debug_port | boot0 调试输出串口使用的串口号 |
| uart_debug_tx   | boot0 调试串口 tx 使用的引脚   |
| uart_debug_rx   | boot0 调试串口 rx 使用的引脚   |

示例

```ini
[uart_para]
uart_debug_port = 0
uart_debug_tx   = port:PA16<5><1><default><default>
uart_debug_rx   = port:PA17<5><1><default><default>
```

### [uartX]

UART 引脚配置

| 配置项    | 配置项含义                                    |
| --------- | --------------------------------------------- |
| uart_tx   | UART TX 的 GPIO 配置                          |
| uart_rx   | UART RX 的 GPIO 配置                          |
| uart_type | UART 类型，有效值为：2/4/8; 表示 2/4/8 线模式 |

示例

```ini
[uart0]
uart_tx         = port:PA16<5><1><default><default>
uart_rx         = port:PA17<5><1><default><default>
```

### [twiX]

TWI 引脚配置


| 配置项   | 配置项含义             |
| -------- | ---------------------- |
| twiX_sck | TWI 的时钟的 GPIO 配置 |
| twiX_sda | TWI 的数据的 GPIO 配置 |

### [sdcX]

SDIO，MMC 引脚配置


| 配置项          | 配置项含义                      |
| --------------- | ------------------------------- |
| card_ctrl       | 控制器                          |
| card_high_speed | 速度模式 0 为低速，1 为高速     |
| card_line       | 1，4 线卡可以选择               |
| sdc_d1          | sdc 卡数据 1 线信号的 GPIO 配置 |
| sdc_d0          | sdc 卡数据 2 线信号的 GPIO 配置 |
| sdc_clk         | sdc 卡时钟信号的 GPIO 配置      |
| sdc_cmd         | sdc 命令信号的 GPIO 配置        |
| sdc_d3          | sdc 卡数据 3 线信号的 GPIO 配置 |
| sdc_d2          | sdc 卡数据 4 线信号的 GPIO 配置 |

示例

```ini
[sdc0]
card_ctrl       = 0
card_high_speed = 0
card_line       = 4
sdc_d1          = port:PA27<2><1><3><default>
sdc_d0          = port:PA26<2><1><3><default>
sdc_clk         = port:PA29<2><1><3><default>
sdc_cmd         = port:PA25<2><1><3><default>
sdc_d3          = port:PA24<2><1><3><default>
sdc_d2          = port:PA28<2><1><3><default>
```

### [sdcXdet_para]

卡检测引脚配置


| 配置项   | 配置项含义   |
| -------- | ------------ |
| sdcX_det | 卡插入检测脚 |

示例

```ini
[sdc0det_para]
sdc0_det        = port:PA23<0><1><3><default>
```

### [usbX]

USB 配置


| 配置项            | 配置项含义                                                   |
| ----------------- | ------------------------------------------------------------ |
| usb_used          | USB使能标志。置1，表示系统中USB模块可用,置0,则表示系统USB禁用。 |
| usb_port_type     | USB端口的使用情况。 0: device only;1: host only;2: OTG       |
| usb_detect_type   | USB端口的检查方式。0: 不做检测;1: vbus/id检查;2: id/dpdm检查 |
| usb_detect_mode   | USB端口的检查方式。0: 线程轮询;1: id中断触发                 |
| usb_id_gpio       | USB ID pin脚配置                                             |
| usb_det_vbus_gpio | USB DET_VBUS pin脚配置                                       |
| usb_drv_vbus_type | vbus设置方式。0: 无; 1: gpio; 2: axp。                       |
| usb_det_vbus_gpio | "axp_ctrl",表示 axp 提供。                                   |
| usbh_driver_level | usb驱动能力等级                                              |
| usbh_irq_flag     | usb中断标志                                                  |

示例

```ini
[usbc0]
usb_used                = 1
usb_port_type           = 2
usb_detect_type         = 1
usb_detect_mode         = 0
usb_id_gpio             = port:PB04<0><0><default><default>
usb_det_vbus_gpio       = port:PA24<0><0><default><default>
usb_drv_vbus_gpio       = port:PA29<0><0><default><default>
usb_drv_vbus_type       = 1
usbh_driver_level       = 5
usbh_irq_flag           = 0
```

### [audiocodec]

内置 audiocodec 配置

| 配置项        | 配置项含义       |
| ------------- | ---------------- |
| dacl_vol      | DAC L 音量       |
| dacr_vol      | DAC R 音量       |
| lineout_vol   | LINEOUT 音量     |
| lineoutl_en   | LINEOUTL 使能    |
| lineoutr_en   | LINEOUTR 使能    |
| mic1_gain     | MIC1 增益        |
| mic2_gain     | MIC2 增益        |
| mic3_gain     | MIC3 增益        |
| mic1_en       | MIC1 启用        |
| mic2_en       | MIC2 启用        |
| mic3_en       | MIC3 启用        |
| mad_bind_en   | MAD 模块绑定     |
| pa_pin_msleep | 功放使能引脚延时 |
| pa_pin        | 功放使能引脚     |

示例

```ini
[audiocodec]
dacl_vol	= 129
dacr_vol	= 129
lineout_vol	= 5
lineoutl_en	= 1
lineoutr_en	= 0
mic1_gain	= 19
mic2_gain	= 19
mic3_gain	= 0
mic1_en		= 1
mic2_en		= 1
mic3_en		= 1
mad_bind_en	= 0
pa_pin_msleep	= 10
pa_pin		= port:PB3<1><default><1><1>
```

### [daudio0]

数字音频配置

| 配置项    | 配置项含义         |
| --------- | ------------------ |
| i2s_mclk  | I2S MCLK 引脚配置  |
| i2s_bclk  | I2S BCLK 引脚配置  |
| i2s_lrck  | I2S LRCK 引脚配置  |
| i2s_dout0 | I2S DOUT0 引脚配置 |
| i2s_din0  | I2S DIN0 引脚配置  |

示例

```ini
[daudio0]
i2s_mclk                    = port:PA23<2><0><1><default>
i2s_bclk                    = port:PA20<2><0><1><default>
i2s_lrck                    = port:PA19<2><0><1><default>
i2s_dout0                   = port:PA22<2><0><1><default>
i2s_din0                    = port:PA21<2><0><1><default>
```

### [dram_para]

> 此项配置仅为兼容配置，实际有用配置项为 `dram_clk`，`dram_no_lpsram` ，其余 `dram_para` 参数没有实际意义。

| 配置项         | 配置项含义                 |
| -------------- | -------------------------- |
| dram_clk       | 如果不为 0，初始化 hspsram |
| dram_no_lpsram | 如果为 0，初始化 lspsram   |

```ini
[dram_para]
dram_clk       = 800
dram_type      = 0xB
dram_zq        = 0x3dbdfda0
dram_odt_en    = 0x1
dram_para1     = 0x000010f2
dram_para2     = 0x02000000
dram_mr0       = 0x1c70
dram_mr1       = 0x42
dram_mr2       = 0x8
dram_mr3       = 0x0
dram_tpr0      = 0x004A2195
dram_tpr1      = 0x02423190
dram_tpr2      = 0x0008B061
dram_tpr3      = 0xB4787896
dram_tpr4      = 0x0
dram_tpr5      = 0x48484848
dram_tpr6      = 0x48
dram_tpr7      = 0x1
dram_tpr8      = 0x0
dram_tpr9      = 0x00
dram_tpr10     = 0x0
dram_tpr11     = 0x00000000
dram_tpr12     = 0x00000000
dram_tpr13     = 0x34050f00
dram_no_lpsram = 0x0
```

### [lcd_fb0]

SPI LCD  配置

> SPI LCD 配置项目较多，部分详细描述可以参照 [显示框架](/sdk_base/disp)

| 配置项           | 配置项含义                                                   |
| ---------------- | ------------------------------------------------------------ |
| lcd_used         | 启用 LCD                                                     |
| lcd_model_name   | lcd 屏模型名字，非必须，可以用于同个屏驱动中进一步区分不同屏。 |
| lcd_driver_name  | lcd面板驱动名称，必须与屏驱动中`strcut __lcd_panel`变量的`name`成员一致。 |
| lcd_x            | lcd X像素                                                    |
| lcd_y            | lcd Y像素                                                    |
| lcd_width        | lcd 物理宽度（单位mm）                                       |
| lcd_height       | lcd 物理高度（单位mm）                                       |
| lcd_data_speed   | lcd 数据速率                                                 |
| lcd_pwm_used     | lcd 背光使用 pwm                                             |
| lcd_pwm_ch       | lcd 背光使用的 pwm 通道                                      |
| lcd_pwm_freq     | lcd 背光使用的频率                                           |
| lcd_pwm_pol      | lcd 背光使用的相位                                           |
| lcd_if           | 0：SPI接口（spi 接口就是俗称的 4 线模式，这是因为发送数据时需要额外借助 DC 线来区分命令和数据，与sclk，cs 和 sda 共四线）<br />1：DBI接口（如果设置了 dbi 接口，那么还需要进一步区分 dbi 接口，需要设置lcd_dbi_if） |
| lcd_pixel_fmt    | 选择传输数据的像素格式                                       |
| lcd_dbi_fmt      | 0：RGB111<br />1：RGB444<br />2：RGB565<br />3：RGB666<br />4：RGB888 |
| lcd_dbi_clk_mode | 选择 dbi 时钟的行为模式                                      |
| lcd_dbi_te       | 使能 te 触发                                                 |
| fb_buffer_num    | 显示 framebuffer 数量，为了平滑显示，这里一般是 2 个，为了省内存也可以改成 1。 |
| lcd_dbi_if       | 0：L3I1<br />1：L3I2<br />2：L4I1<br />3：L4I2<br />4：D2L1  |
| lcd_rgb_order    | 输入图像数据 rgb 顺序识别设置                                |
| lcd_fps          | 设置屏的刷新率，单位 Hz                                      |
| lcd_spi_bus_num  | 选择 spi 总线 id                                             |
| lcd_frm          | frm抖动控制                                                  |
| lcd_gamma_en     | gamma控制使能                                                |
| lcd_backlight    | 背光                                                         |
| lcd_gpio_0       | 用户定义IO定义，一般作为RST                                  |