# DSP 开发工具安装

## 资料准备

要编译和仿真DSP，需要以下资料：

- DSP 核SDK，SDK 需要包含DSP 编译源码。
- Cadence Xtensa 的 Windows IDE 工具 (Xplorer‑8.0.13 版本)， Windows 版本 DSP 的 package 包。
- Cadence Xtensa 的 License，用于服务器代码编译和Xplorer 仿真使用。

其中 Allwinner 提供 DSP 核 SDK 源码包，IDE 工具和 Licence 需要向 Cadence 申请。链接：https://www.cadence.com/en_US/home/tools/ip/tensilica-ip/technologies.html，Xplorer 下载链接：https://www.cadence.com/en_US/home/tools/ip/tensilica-ip/sdk-download.html。

## Linux 环境搭建

### XCC 安装

把 XCC 工具链压缩包放在目录下：

```
<root>/XtDevTools/install/
```

进行解压，解压后工具链应该存放在：

```
<root>/XtDevTools/install/RI‑xxxx‑linux/XtensaTools
```

### package 包安装

DSP 核配置包由数字设计提供，一般为一个tgz 压缩包，可使用以下命令自动安装：

```
./build.sh
```

### 环境变量

`envsetup.sh` 环境变量主要宏如下：

1. PATH 添加编译工具链bin/路径；
2. LM_LICENSE_FILE license服务器地址；
3. XTENSA_SYSTEM DSP核心配置包安装后的路径；
4. XTENSA_CORE DSP核心配置包名称；
5. XTENSA_TOOLS_DIR XCC工具链位置。

当想自定义编译环境或者排除编译环境问题，可以通过检查以上宏是否设置正确。

### 环境变量命令

`envsetup.sh` 脚本同时导出一些命令，用于快速执行某些命令操作。

1. croot // 快速跳转到DSP FreeRTOS SDK 根目录
2. doobjdump // 执行objdump 命令反编译DSP elf 文件
3. dogenlds // 重新生成链接脚本
4. callstack // 执行栈回溯结果解析命令
5. mdsp // 编译dsp

### 编译代码

#### 配置环境变量

```
source build/envsetup.sh
```

![image-20230729230351382](assets/post/dsp_sdk/image-20230729230351382.png)

#### 编译代码

执行`./build.sh` 编译

## 下载固件

1. 把 DSP FreeRTOS SDK 目录下的 `dsp_raw.bin` 拷贝到 R128 根SDK 下的 `board/r128s/xxx/bin/` 下，并重命名为`rtos_dsp_sun20iw2p1.fex`。
2. R128 SDK 下重新打包烧录，即可更新DSP 固件。

## Windows 环境

### 安装 Xtensa Xplorer 

Windows 下直接双击安装文件进行安装。

![image-20230729231257263](assets/post/dsp_sdk/image-20230729231257263.png)

然后同意许可文件

![image-20230729231319708](assets/post/dsp_sdk/image-20230729231319708.png)

记得修改下载的地址

![image-20230729231353206](assets/post/dsp_sdk/image-20230729231353206.png)

选择 “否”

![image-20230729231428471](assets/post/dsp_sdk/image-20230729231428471.png)

点击 Next -> Next -> Next -> Next

![image-20230729231445603](assets/post/dsp_sdk/image-20230729231445603.png)

开始安装

![image-20230729231538883](assets/post/dsp_sdk/image-20230729231538883.png)

去掉这个勾

![image-20230729231745728](assets/post/dsp_sdk/image-20230729231745728.png)

选择工作环境

![image-20230729231801562](assets/post/dsp_sdk/image-20230729231801562.png)

初始化中

![image-20230729231813252](assets/post/dsp_sdk/image-20230729231813252.png)

### License 配置

在这里配置 License 即可

![image-20230729231941432](assets/post/dsp_sdk/image-20230729231941432.png)

### 安装 package 包

检查 package

![image-20230729232029991](assets/post/dsp_sdk/image-20230729232029991.png)

没有对应package，我们要手动安装：

![image-20230729232040566](assets/post/dsp_sdk/image-20230729232040566.png)

选择此项

![image-20230729232058105](assets/post/dsp_sdk/image-20230729232058105.png)

找到 package 的 tgz 文件

![image-20230729232105249](assets/post/dsp_sdk/image-20230729232105249.png)

导入即可

![image-20230729232136046](assets/post/dsp_sdk/image-20230729232136046.png)
