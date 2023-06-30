# RTOS 使用说明

## 使用串口访问设备

![image-20230719141008548](assets/post/rtos_manual/image-20230719141008548.jpg)

使用USB TypeC 连接线连接开发板 USB转串口 的接口，安装串口驱动程序：[CH341SER.EXE](https://www.wch.cn/download/CH341SER_EXE.html)

![image-20230719141720434](assets/post/rtos_manual/image-20230719141720434.png)

到设备管理器找到需要的串口，这里是 `COM8`

![image-20230719141743917](assets/post/rtos_manual/image-20230719141743917.png)

使用串口访问工具 PuTTY 打开串口，这里是 COM8，波特率 115200。

![image-20230719141835698](assets/post/rtos_manual/image-20230719141835698.png)

打开之后回车即可访问控制台。

![image-20230719141909477](assets/post/rtos_manual/image-20230719141909477.png)

可以输入 `help` 命令查看支持的命令。

![image-20230719142031108](assets/post/rtos_manual/image-20230719142031108.png)

## 查看三个核心运行频率

连接开发板的时候可以点击 RESET 按钮重置 CPU，查看输出。

![image-20230719142139353](assets/post/rtos_manual/image-20230719142139353.jpg)

这里可以看到 M33 核心运行频率 192MHz，DSP 运行频率 400MHz，C906 运行频率 480MHz

![image-20230719142335763](assets/post/rtos_manual/image-20230719142335763.png)