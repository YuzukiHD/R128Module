# R128 EVT 开发套件

针对 R128 模组，百问科技推出了 R128 EVT 开发套件作为快速开发评估工具。

![img](assets/post/r128_evt/1697702132727-微信图片_20231019155513.jpg)

- 板载 R128-S2-N16R16 模组
- 板载 USB Type C OTG
- 板载 UART 转 USB 芯片
- 板载 RESET，FEL 下载按键
- 板载 PMU，支持 USB 5V 供电和 DC 5~12V 供电
- 板载 4 寸 86 面板屏
- 板载 4 寸 FT5136 电容式触摸屏
- 板载 DVP 摄像头接口
- 板载双 MIC 
- 板载功放，支持 AEC 回音消除
- 板载 SD Card 卡槽
- 板载 ADC 按键
- IPEX 天线

## 资源下载

- 硬件工程开源地址：[https://oshwhub.com/gloomyghost/r128-module](https://oshwhub.com/gloomyghost/r128-module)
- 电路图：[SCH_R128_EVT_2023-10-20.pdf](https://www.aw-ol.com/downloads?cat=22)
- PCB：[ProDocument_R128-EVT_2023-10-20.epro](https://www.aw-ol.com/downloads?cat=22)
- GERBER：[Gerber_R128_EVT_2023-10-20.zip](https://www.aw-ol.com/downloads?cat=22)
- STL：[DXF_R128_EVT_2023-10-20.dxf](https://www.aw-ol.com/downloads?cat=22)
- 3D STEP：[3D_R128_EVT_2023-10-20.zip](https://www.aw-ol.com/downloads?cat=22)
- BOM：[BOM_R128-EVT_R128_EVT_2023-10-20.xlsx](https://www.aw-ol.com/downloads?cat=22)
- 点位图：[PickAndPlace_R128_EVT_2023-10-20.xlsx](https://www.aw-ol.com/downloads?cat=22)
- USB 转 UART 驱动下载：[CH341SER.EXE](https://www.wch.cn/downloads/CH341SER_EXE.html)

## 购买链接

- [百问科技淘宝店 - 全志R128 EVT](https://m.tb.cn/h.5T4uATe?tk=S079W0vCt6v)

## 原理图模块介绍

### 硬件框图

![image-20231020135354211](assets/post/r128_evt/image-20231020135354211.png)

### PCB 框图

![image-20231020135153724](assets/post/r128_evt/image-20231020135153724.png)

### 电源

EVT 支持 USB 供电与 DC 12V 直流供电，通过一个滑动开关控制电源。并且板载 5V 转 3.3V 电源芯片，为外设和 R128 提供最高 2A 的电流。

![image-20231020114133831](assets/post/r128_evt/image-20231020114133831.png)

### R128 模组

R128 模组使用 SMT 贴装于 开发板上，其中的PA16，PA17脚复用为 UART 调试脚，已经在板上连接了 UART 转 USB 芯片。

![image-20231020114350693](assets/post/r128_evt/image-20231020114350693.png)

### 系统按键与 IO 复用

EVT 板载 2 颗按键，控制 R128 芯片 RESET 与 FEL 烧录功能。

IO 复用如图所示，其中 SD 卡与摄像头 CSI 是共用 IO 状态，使用时需要注意。

![image-20231020114409670](assets/post/r128_evt/image-20231020114409670.png)

### LCD 接口

EVT 板载 40 Pin LCD 接口，使用的协议是 intel 8080，其中支持电容式触摸屏。

![image-20231020114822596](assets/post/r128_evt/image-20231020114822596.png)

### USB 与 UART

EVT 板载两个 USB Type-C 连接器，板载 CH340N USB 转 UART 接口芯片，方便开发使用。

![image-20231020115007547](assets/post/r128_evt/image-20231020115007547.png)

### 麦克风与扬声器

开发板板载两颗模拟硅麦。并且板载功放电路与 AEC 回音消除电路。

![image-20231020115142551](assets/post/r128_evt/image-20231020115142551.png)

### CSI 摄像头

EVT 支持 DVP 摄像头，型号 GC0308。

![image-20231020115222783](assets/post/r128_evt/image-20231020115222783.png)

### TF Card

EVT 支持 SD 卡，支持最高 SDXC 规格

![image-20231020132406325](assets/post/r128_evt/image-20231020132406325.png)

### ADC 按键

EVT 板载 ADC 按键，连接到 R128 模组的 PB1 引脚上

![image-20231020132625162](assets/post/r128_evt/image-20231020132625162.png)

## 烧录测试固件

### 安装烧录软件

前往 [全志在线-资料下载](https://www.aw-ol.com/downloads?cat=5) 页面，选择下载 `AllwinnertechPhoeniSuitRelease20230905.zip`

![image-20230905133728922](assets/post/r128_evt/image-20230905133728922.png)

将下载的压缩包解压，提取到文件夹中

![image-20230905133843048](assets/post/r128_evt/image-20230905133843048.png)

在文件夹中找到需要的 Windows 版本，同样解压到文件夹中

![image-20230905133951814](assets/post/r128_evt/image-20230905133951814.png)
找到 `PhoenixSuit.exe` 双击打开即可

![image-20230905134043369](assets/post/r128_evt/image-20230905134043369.png)

打开后的软件如下所示

![image-20230905134135211](assets/post/r128_evt/image-20230905134135211.png)

### 安装 USB 驱动

下载程序需要安装上 USB 驱动，驱动位于刚才安装的烧录软件 PhoenixSuit 的 Drivers 目录中：

![image-20230905134231947](assets/post/r128_evt/image-20230905134231947.png)

在这里面可以找到两个驱动，安装 AW_Deiver

![image-20230905134342666](assets/post/r128_evt/image-20230905134342666.png)

运行 `InstallUSBDrv.exe` 即可开始安装

![image-20230905134449668](assets/post/r128_evt/image-20230905134449668.png)

安装过程中提示无法验证此驱动程序软件的发布者点击始终安装即可。

![image-20230905140129855](assets/post/r128_evt/image-20230905140129855.png)

安装完成后，将 EVT 通过 USB TypeC 线接入电脑，注意需要插入 OTG 口，然后打开开关。

![image-20231020132928229](assets/post/r128_evt/image-20231020132928229.png)

然后按住 FEL 按键，之后按一下 RESET 按键重置芯片，等待电脑连接后再松开 FEL 按键

![image-20231020133324125](assets/post/r128_evt/image-20231020133324125.png)

连接的 DevKit 可以在 设备管理器-通用串行总线控制器看到设备：`USB Device(VID_1f3a_PID_efe8)`

![image-20230905134648655](assets/post/r128_evt/image-20230905134648655.png)

如果没找到这个设备，但是看到了一个未知设备，请尝试手动安装驱动，详见 [开发环境搭建-Windows 驱动安装](https://r128.docs.aw-ol.com/r128/prepare_dev_env/)

![image-20230905135828363](assets/post/r128_evt/image-20230905135828363.png)

### 获取测试固件

前往 [全志在线-资料下载](https://www.aw-ol.com/downloads?cat=21) 页面找到 R128 固件，选择下载 `R128EVT出厂固件` 

![image-20231020144055986](assets/post/r128_evt/image-20231020144055986.png)

然后将固件 `rtos_freertos_r128s2_evt_uart0_16mnor.img` 解压缩出来。

![image-20231020133629414](assets/post/r128_evt/image-20231020133629414.png)

### 烧录测试固件

打开 PhoneixSuit，选择一键刷机，点击浏览，选择下载的  `rtos_freertos_r128s2_evt_uart0_16mnor.img` 

![image-20231020133651312](assets/post/r128_evt/image-20231020133651312.png)

配置烧录选项，选择全盘擦除升级

![image-20231020133720236](assets/post/r128_evt/image-20231020133720236.png)

将 EVT 通过 USB TypeC 线接入电脑，注意需要插入 OTG 口，然后打开开关。

![image-20231020132928229](assets/post/r128_evt/image-20231020132928229.png)

然后按住 FEL 按键，之后按一下 RESET 按键重置芯片，等待电脑连接后再松开 FEL 按键

![image-20231020133324125](assets/post/r128_evt/image-20231020133324125.png)

然后就会进入烧录状态

![image-20231020133805053](assets/post/r128_evt/image-20231020133805053.png)

提示固件烧写成功

![image-20231020133908668](assets/post/r128_evt/image-20231020133908668.png)

可以看到屏幕点亮显示 LOGO

![微信图片_20231019155511.jpg](assets/post/r128_evt/1697702132066-微信图片_20231019155511-resized.jpg)

## R128 EVT 外设测试

### UART 控制台测试

烧录之后，可以使用 USB Type-C 数据线连接 EVT 开发板

![image-20231020134959281](assets/post/r128_evt/image-20231020134959281.png)

然后配置为对应的 COM 口，波特率设置为 115200

![image-20231020135103179](assets/post/r128_evt/image-20231020135103179.png)

即可访问控制台

![image-20231020135125202](assets/post/r128_evt/image-20231020135125202.png)

### 显示屏测试

正常测试固件启动会显示 LOGO 图

![微信图片_20231019155511.jpg](assets/post/r128_evt/1697702132066-微信图片_20231019155511-resized.jpg)

可以使用以下命令测试显示屏

```
disp -c 0 1
```

![image-20231020140111200](assets/post/r128_evt/image-20231020140111200.png)

此时屏幕将显示 ColorBar

![image-20231020140201942](assets/post/r128_evt/image-20231020140201942.png)

### 摄像头测试

前往 [全志在线-资料下载](https://www.aw-ol.com/downloads?cat=21) 页面找到 R128 固件，选择下载 `R128EVT测试固件` ，烧录 `摄像头测试固件.img` 

![image-20231020155529573](assets/post/r128_evt/image-20231020155529573.png)

如图接入摄像头

![image-20231020155626672](assets/post/r128_evt/image-20231020155626672.png)

运行

```
camera_preview csi
```

![image-20231020160001382](assets/post/r128_evt/image-20231020160001382.png)

显示屏会显示摄像头拍到的画面

### TF Card 测试

前往 [全志在线-资料下载](https://www.aw-ol.com/downloads?cat=21) 页面找到 R128 固件，选择下载 `R128EVT测试固件` ，烧录 `R128EVT SD卡测试固件.img` 

![image-20231020155211090](assets/post/r128_evt/image-20231020155211090.png)

然后烧录启动后插入 TF 卡，注意请先把 SD 卡格式化为 FAT32 格式。请注意测试 SD 卡时请断开摄像头连接。

![image-20231020155341100](assets/post/r128_evt/image-20231020155341100.png)

可以在 LOG 中查看到 SD 卡正常挂载。

![image-20231020155104616](assets/post/r128_evt/image-20231020155104616.png)
