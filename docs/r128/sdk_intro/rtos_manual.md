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

## 系统调试命令

### help

```
help
```

获取系统支持的终端命令

![image-20230729140323853](assets/post/rtos_manual/image-20230729140323853.png)

### backtrace

查看指定任务堆栈回溯信息

```
backtrace [taskname | tasknumber]
```

![image-20230729140459360](assets/post/rtos_manual/image-20230729140459360.png)

### top

查看系统任务状态

```
top [‑d 2]
```

![image-20230729140552479](assets/post/rtos_manual/image-20230729140552479.png)

### ts

展示所有FreeRTOS任务的状态

```
ts
```

![image-20230729140653493](assets/post/rtos_manual/image-20230729140653493.png)

### list_irq

列出所有支持的中断及其状态

````
list_irq
````

![image-20230729140710614](assets/post/rtos_manual/image-20230729140710614.png)

### free

查看系统堆的内存

```
free
```

![image-20230729140917569](assets/post/rtos_manual/image-20230729140917569.png)

### p

读取地址 `reg_start_addr` 对应长度 `len` 的内容

```
p [reg_start_addr] [len]
```

![image-20230729141259061](assets/post/rtos_manual/image-20230729141259061.png)

### m

向地址 `reg_address` 写值 `reg_value`

```
m [reg_address] [reg_value]
```

![image-20230729141554188](assets/post/rtos_manual/image-20230729141554188.png)

### forkarg

修改fork命令参数，可设置fork命令创建的任务的优先级及其栈大小

```
forkarg [‑p priority] [‑s size]
```

![image-20230729141631684](assets/post/rtos_manual/image-20230729141631684.png)

### fork

不占用控制台任务，在后台运行命令

```
fork command [arg1 ...]
```

![image-20230729141743004](assets/post/rtos_manual/image-20230729141743004.png)

## 文件系统命令

### df

查看文件系统剩余空间

```
df [path]
```

![image-20230729142048604](assets/post/rtos_manual/image-20230729142048604.png)

### ls

列出指定文件或者目录信息

```
ls [‑h] [‑l] [‑k] [file1]
```

![image-20230729142121783](assets/post/rtos_manual/image-20230729142121783.png)

### cat

以ACSII码的形式，读取指定的文件

```
cat <file>
```

![image-20230729142210387](assets/post/rtos_manual/image-20230729142210387.png)

### hexdump

查看二进制文件内容

```
hexdump [‑n num] [‑C] file
```

![image-20230729142317685](assets/post/rtos_manual/image-20230729142317685.png)