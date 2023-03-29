# 开发环境搭建

系统需求：

- 需要 x64 位处理器和操作系统
- 操作系统: Windows 10（WSL2），Docker，Linux (必须为64bit)
- 处理器: Intel Pentium Processor E2160
- 内存: 2 GB RAM

## Linux 搭建开发环境

这里以常用的几款 Linux 发行版作为示例，搭建开发环境：

### Ubuntu 22.04 / 20.04

1. 更新软件源，更新系统软件包

```shell
sudo apt-get update
sudo apt-get upgrade -y
```

2. 安装开发依赖

```shell
sudo apt-get install build-essential subversion git libncurses5-dev zlib1g-dev gawk flex bison quilt libssl-dev xsltproc libxml-parser-perl mercurial bzr ecj cvs unzip lsof 
```

3. 安装相关工具

```shell
sudo apt-get install kconfig-frontends android-tools-mkbootimg python2 libpython3-dev 
```

4. 增加架构支持

```shell
sudo dpkg --add-architecture i386
sudo apt-get update
```

5. 安装支持包

```shell
sudo apt install gcc-multilib 
sudo apt install libc6:i386 libstdc++6:i386 lib32z1
```

### Ubuntu 18.04
1. 更新软件源，更新系统软件包

```shell
sudo apt-get update
sudo apt-get upgrade -y
```

2. 安装开发依赖

```shell
sudo apt-get install build-essential subversion git libncurses5-dev zlib1g-dev gawk flex bison quilt libssl-dev xsltproc libxml-parser-perl mercurial bzr ecj cvs unzip lsof 
```

3. 安装相关工具

```shell
sudo apt-get install android-tools-mkbootimg libpython3-dev 
```

4. 增加架构支持

```shell
sudo dpkg --add-architecture i386
sudo apt-get update
```

5. 安装支持包

```shell
sudo apt install gcc-multilib 
sudo apt install libc6:i386 libstdc++6:i386 lib32z1
```

### Arch Linux / Manjaro

1. 更新软件源，更新系统软件包

```shell
pacman -Syyuu
```

2. 安装开发依赖

```shell
pacman -S --needed base-devel autoconf automake bash binutils bison bzip2 fakeroot file findutils flex gawk gcc gettext git grep groff gzip time unzip util-linux wget which zlib asciidoc help2man intltool perl-extutils-makemaker swig 
```

3. 安装相关工具

```shell
pacman -S --needed libelf libtool libxslt m4 make ncurses openssl patch pkgconf python rsync sed texinfo
```

4. 增加架构支持

```shell
pacman -S --needed multilib-devel
```

### CentOS / Fedora / openEuler

```shell
sudo dnf --setopt install_weak_deps=False --skip-broken install bash-completion bzip2 gcc gcc-c++ git make ncurses-devel patch rsync tar unzip wget which diffutils python2 python3 perl-base perl-Data-Dumper perl-File-Compare perl-File-Copy perl-FindBin perl-Thread-Queue glibc.i686
```

### openSUSE

```shell
sudo zypper install --no-recommends asciidoc bash bc binutils bzip2 fastjar flex gawk gcc gcc-c++ gettext-tools git git-core intltool libopenssl-devel libxslt-tools make mercurial ncurses-devel patch perl-ExtUtils-MakeMaker python-devel rsync sdcc unzip util-linux wget zlib-devel glibc-devel-32bit
```

## Docker 搭建开发环境



## 驱动安装

### Windows 驱动安装

Windows 驱动下载地址：[https://www.aw-ol.com/downloads/resources/15](https://www.aw-ol.com/downloads/resources/15)

1. 下载后解压 `UsbDriver` 到任意文件夹

![image-20230329174037857](assets/post/prepare_dev_env/image-20230329174037857.png)

2. 右键此电脑，管理

![image-20230329174138747](assets/post/prepare_dev_env/image-20230329174138747.png)

3. 链接待烧录的设备，并使设备进入下载模式，找到资源管理器里的`USB Device(VID_1f3a_PID_efe8)`

![6fa8089e-5d2b-47f1-965f-9dcdf0c984da-image.png](assets/post/prepare_dev_env/1648732462492-6fa8089e-5d2b-47f1-965f-9dcdf0c984da-image.png)

4. 右键，更新驱动程序

![f07e3def-dade-4069-8f1b-c4bbe2dc8078-image.png](assets/post/prepare_dev_env/1648732531793-f07e3def-dade-4069-8f1b-c4bbe2dc8078-image.png)

5. 浏览我的电脑查找

![f38b617c-b68d-4aea-abba-2cbdf5e9ae29-image.png](assets/post/prepare_dev_env/1648732573134-f38b617c-b68d-4aea-abba-2cbdf5e9ae29-image.png)

6. 让我从计算机上的可用驱动列表中选取

![f02c8901-55d1-47d2-ac13-fa3baf838fa8-image.png](assets/post/prepare_dev_env/1648732593215-f02c8901-55d1-47d2-ac13-fa3baf838fa8-image.png)

7. 从磁盘安装

![43440003-9bbc-45d8-a4cd-36260a80bb0e-image.png](assets/post/prepare_dev_env/1648732623019-43440003-9bbc-45d8-a4cd-36260a80bb0e-image.png)

8. 浏览

![2f99300d-cfd7-4aa4-b3aa-af1f893d3dae-image.png](assets/post/prepare_dev_env/1648732646080-2f99300d-cfd7-4aa4-b3aa-af1f893d3dae-image.png)

9. 选择刚才解压出来的文件夹中的`usbdrv.inf` 文件

![8011100e-3e20-46a0-a4eb-c2bb372d6e6f-image.png](assets/post/prepare_dev_env/1648732680712-8011100e-3e20-46a0-a4eb-c2bb372d6e6f-image.png)

10. 确定

![8b082aaf-20b3-4b7e-9a15-046a5db84e6a-image.png](assets/post/prepare_dev_env/1648732725713-8b082aaf-20b3-4b7e-9a15-046a5db84e6a-image.png)

11. 下一页

![d0928686-ccbc-4ca4-b5f1-54ffc1edde5c-image.png](assets/post/prepare_dev_env/1648732741539-d0928686-ccbc-4ca4-b5f1-54ffc1edde5c-image.png)

12. 安装完成，关闭窗口

![c58ccd65-afd3-4bc9-b5f9-fd89f6b3ed66-image.png](assets/post/prepare_dev_env/1648732760111-c58ccd65-afd3-4bc9-b5f9-fd89f6b3ed66-image.png)

#### Windows 驱动常见问题

- 问题：

出现两个 USB Devices

![6c485bb7-a1a2-4f6c-b275-3771fbb0f1ad-image.png](assets/post/prepare_dev_env/1660320391935-6c485bb7-a1a2-4f6c-b275-3771fbb0f1ad-image.png)

解决方法：

- 右键卸载设备
- 勾选卸载驱动程序

![image-20230329174851812](assets/post/prepare_dev_env/image-20230329174851812.png)

- 重新安装一遍
