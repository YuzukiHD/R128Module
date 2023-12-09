# RTOS 存储简介

FreeRTOS 设计的完整的 IO 栈包括 **iobox、vfs、fs、blkpart、flash driver**。考虑到 RTOS 比 Linux 更精小高效和 Flash 不需要考虑寻址的特点，并没参考 Linux 设计 Page Cache 和 IO调度器，但在 Flash driver 添加了 Cache 以加速性能。

常见的系统中，都会为 Flash 设备专门设计 MTD 层，起到对 flash driver 进一步封装。在 RTOS 的 IO 栈中，blkpart 就实现了MTD层的功能，除此之外，还实现了分区解析和操作。为了兼容和符合规范，在将来的迭代中可以考虑把 blkpart 拆分出 MTD 层。

## iobox简介

iobox 是在 RTOS 实现的一套简单的 IO 命令的集合。其在 `menuconfig` 中的路径为：

```
System components
	|-> aw components
		|-> iobox
```

目前支持以下命令：

| 命令      | 功能                       | 示例                                  |
| :-------- | :------------------------- | :------------------------------------ |
| `ls`      | 列出文件                   | `ls /data`                            |
| `ll`      | 等效于ls -lk               | `ll /data`                            |
| `cat`     | 读取并打印文件             | `cat /data/demo`                      |
| `hexdump` | 十六进制显示文件内容       | `hexdump /data/demo`                  |
| `hd`      | 等效于hexdump -C           | `hd /data/demo`                       |
| `cp`      | 复制文件                   | `cp /data/demo /data/demo1`           |
| `mv`      | 重命名文件                 | `mv /data/demo /data/demo1`           |
| `rm`      | 删除文件                   | `rm /data/demo`                       |
| `unlink`  | 取消硬链接(等效于删除文件) | `unlink /data/demo`                   |
| `link`    | 创建硬链接                 | `link /data/demo`                     |
| `rwcheck` | 读写测试                   | `rwcheck -d /data -s 256k -s 1000000` |
| `rwspeed` | 顺序读写性能测试           | `rwspeed -d /data -s 128k -t 3`       |
| `vi`      | vi文本编辑器               | `vi /data/demo`                       |
| `df`      | 显示fs信息                 | `df /data`                            |

>  -h参数可以获取详细的使用说明

## VFS简介

VFS 类似与 Linux VFS，是为所有的 FS 提供统一的标准，向上注册和提供系统调用。正因为有 VFS 的存在，用户才可以忽略文件系统的差异，只需要调用规范的 IO 函数即可实现 IO 操作，例如 `read()`，`ioctl()`，`rename()`。

RTOS 的 VFS 移植自第三方的开源 VFS，在 `menuconfig` 的选择路径为：

```
System components
	|-> thirdparty components
		|-> Virtual Filesystem
```

## FS简介

### spiffs 和 littlefs

当前，RTOS 支持 spiffs 和 littlefs 两种文件系统

总的来说，**推荐使用littlefs**。

`spiffs` 在 `menuconfig` 的路径为：

```
System components
	|-> thirdparty components
		|-> SPIFFS Filesystem
```

`littlefs` 在  `menuconfig` 的路径为：

```
System components
	|-> thirdparty components
		|-> LittleFS Filesystem
			|-> LFS Codes Version (v2.2.1)
```

RTOS 中暂不支持 Linux 上常见的 flash 文件系统，例如 yaffs，jffs2，主要是因为 开源协议 和 体量臃肿 的考虑。

与 Linux 相似，文件系统需要使用必须先挂载。littlefs 和 spiffs提供的挂载/卸载接口如下：


```C
#include <spiffs.h>
int spiffs_mount(const char *source, const char *target, bool format);
int spiffs_umount(const char *target);

#incldue <littlefs.h>
int littlefs_mount(const char *dev, const char *mnt, bool format);
int littlefs_umount(const char *mnt);
```

### 打包FS资源文件

在项目中，如果需要在编译时创建基于文件系统的资源镜像包，在烧录的时候直接写入分区，可以使用以下方法：

1. 修改分区文件，添加 `downloadfile` 配置
2. 在资源目录创建与分区名同名的文件夹，并把资源文件放入此文件夹

由于 RTOS 系统默认使用 littlefs，因此创建的资源文件包也是基于 littlefs 。

例如，需要在UDISK分区创建资源包，可以这么改：

第一步，在 `sys_partition{_NOR}.fex` 中，在 `UDISK` 分区项中修改 `downloadfile` 配置为 `data_` 开头的文件：

```
[partition]
     name         = UDISK
     downloadfile = "data_udisk.fex"
     user_type    = 0x8100
```

需要注意，如果使能了 `CONFIG_XIP`，则该配置文件名称为` sys_partition_xip_{_NOR}.fex`。

资源文件名必须以data_开头，这是触发脚本打包资源文件的标识。其余的名字不限制。

第二步，在`tina-rt/tools/data`中创建与**分区名**相同名字的文件夹，例如

 ```
$ mkdir -p board/<chip_name>/<project_name>/data/UDISK
 ```

 并把资源文件拷贝进去即可。

### devfs

在 RTOS 里，有实现 devfs 的设备文件系统。正因为 `devfs` 的存在，在 `/dev` 目录下，就可以看到设备文件。

OTA更新可以直接操作设备节点，以实现分区级别的更新。

由于历史原因，驱动可能在 `/dev` 下注册了 设备节点和分区名节点，也可能在 `/dev` 下注册了设备节点，在 `/dev/by-name` 下注册别名节点。例如：

```
/dev/UDISK
/dev/by-name/UDISK
/dev/nand0p5
/dev/NOR
```

开发者可以通过 `ls /dev` 命令确认驱动把设备注册在哪里。

## 文件操作方式

### 普通文件读写接口

可以使用标准的 Posix 操作接口，如：

```
ssize_t read (int __fd, void *__buf, size_t __nbytes);
ssize_t write (int __fd, const void *__buf, size_t __n);
int close (int __fd);
int open (char *name, int flag);
```

也可以使用 C 库的文件操作接口，如：

```
size_t fread (void *__restrict __ptr, size_t __size, size_t __n, FILE *__restrict __stream);
size_t fwrite (const void *__restrict __ptr, size_t __size, size_t __n, FILE *__restrict __s);
FILE *fopen (const char *__restrict __filename, const char *__restrict __modes);
int fclose (FILE *__stream);
```

### 设备分区文件操作

存储分区设备节点可以被当前一个普通文件来读写，如以下例子：

```
// 该例子可用于读取 env 分区中的内容
char buffer[32];
int fd = open("/dev/env", O_RDONLY);
read(fd, buffer, sizeof(buffer));
close(fd);

```

## blkpart简介

如上所属，RTOS 设计的 blkpart 类似与 MTD，起到对 flash driver 进一步封装的功能，此外还实现了分区解析和分区操作。

blkpart与MTD设计的出发点有些不同，blkpart如其名，主要是把存储空间按块设备分区的逻辑管理，而MTD更多只是规范flash驱动的注册和使用方法。期待将来的迭代中能对blkpart进一步规范，拆离出MTD层，让开发者更好理解。

blkpart在  `menuconfig` 的路径为：

```
System components
	|-> aw components
		|-> Block Partition
			|-> Partition Table Size (KB) # 配置GPT分区表的存储空间大小
			|-> Logical Partition Start Address (KB) # 分区表起作用的开始偏移
```

驱动通过调用以下接口注册和注销设备：

```
int add_blkpart(struct blkpart *blk);
void del_blkpart(struct blkpart *blk);
```

注册设备后，blkpart会自行解析分区，并向上注册。上层可以通过以下接口访问设备：

```
ssize_t blkpart_read(struct part *, uint32_t, uint32_t, void *);
ssize_t blkpart_write(struct part *, uint32_t, uint32_t, const void *);
int blkpart_erase(struct part *, uint32_t, uint32_t);
```

这几个接口就类似于MTD中的 `mtd_read/mtd_write/mtd_erase`。

## Flash 驱动

RTOS 主要支持 SPINOR 和 SPINAND 两类存储介质。

### SPI NOR

NOR 驱动相对简单，只是按照协议通过 spi 发送操作指令。其中为了加快性能，在 NOR 驱动上添加了简单的Cache层。部分 Flash 物料在测试过程中发现了一些掉电场景下会掉码问题，因此若该物料支持写保护功能，则可以使能写保护来避免掉电场景下出现掉码问题。

#### Cache

Cache 层的代码，是为了尽可能合并连续写入的数据，再一次性写入。

NOR 写之前必须先擦除，普遍支持 `Sector Erase`，`32KB Block Erase` ，`64KB Block Erase` 和 `Chip Erase`的四种擦除方式。查看 NOR 的规格书发现，除了擦除大小不一致外，擦除性能也有很大差别：

|  厂家   |  写(ms)  | 4K擦除(ms) | 32K擦除(ms) | 64K擦除(ms) | 全盘擦除(s) |
| :-----: | :------: | :--------: | :---------: | :---------: | :---------: |
|  MXIC   | 0.33~1.2 |   25~120   |   140~650   |   250~650   |    26~60    |
| Winbond |  0.7~3   |   45~400   |  120~1600   |  150~2000   |   40~200    |
|   GD    | 0.5~2.4  |   50~400   |   160~800   |  300~1200   |   50~120    |
|  ESMT   |  0.5~3   |   40~300   |  200~1000   |  300~2000   |   60~200    |

总的来说，擦除性能 `Chip Erase > 64KB Block Erase > 32KB Block Erase > Sector Erase`。而一次写操作的耗时主要是擦除，因此，如果需要优化写性能，需要尽可能使用更大的擦除。

考虑到文件系统的空间浪费情况，文件系统需要采用 4K 的块大小，进一步导致驱动必须 `Sector Erase`, 也就是4K擦除。这样的矛盾导致 NOR 的写性能偏低。

因此，创建了 64K Block 大小的 Cache, 每一次文件系统的写和擦除操作都缓存起来，在合适时机一次写擦除和写入。为了防止 Cache 的存在导致文件系统丢数据，合适时机的选择非常重要。

在实现中充分考虑的 littlefs 的机制，在以下时机写入保证了不会丢失数据：

1. FS主动调用 sync 要求回刷数据时
2. Cache缓存的数据满足64K Block或者32K Block了
3. FS 写入的地址跨了另外一个Block

其他文件系统的支持，需要结合文件系统的实现，以评估是否会丢失数据。

#### 写保护

在测试中发现，掉电时如果主控依然在发送数据，NOR很大概率会造成误写，把数据写入其他地址，导致数据被损坏。为了解决这个问题，除了硬件实现掉电时马上复位的方法外，软件上也可以使能写保护，让NOR在误写时无法写入。

目前发现的写保护机制有两种，一个是区间保护，一个是独立块保护，两者的差别主要是保护和解保护的最小颗粒不同。

区间保护(Status Register Memory Protection, 或描述为bp写保护，Block Protect，Block Lock protection mode，protect area等)按从低或高地址开始的一段连续空间保护。以 16M 容量的NOR为例，配置为从低地址开始的8M空间，可实现0-8M的空间无法写入，但无法保护 8-16M 的空间。不同厂家划分的保护区间可能有稍许不同，但都无法做到精细保护。例如如果需要写第7M地址的数据，此时只能把保护范围缩减为 0-4M，使得 4-16M 可写，此时依然会有大概率会误写数据。

独立块保护(Individual Block Memory Protect，或描述为Individual Sector Protection mode等)是以块为单位单独控制是否保护。一般而言，块大小是64K，即一次可以做到只解保护64K的小范围。

从理论分析，独立块保护的掉电误写风险远比区间保护小。

启用写保护功能，还需要考虑频繁保护与解保护会带来多大的性能损失和寿命损失。

区间保护修改的状态寄存器跟NOR一样，只有10W次的擦写寿命，且写入时间在ms级别。如果使用区间保护，频繁的修改保护区间，会导致性能下降，且会加速状态寄存器的磨损。

独立块保护修改的是SRAM状态位，无明显擦写寿命限制，且写入时间在ns级别，即使频繁修改保护状态，对性能影响非常微弱。

因此，如果NOR支持，推荐使用独立块保护。区间保护更适用于不需要频繁解保护的场景。

总的来说，

* 如果NOR支持独立块保护，则采用独立块保护，再根据预算决定是否采用硬件复位。
* 如果NOR不支持独立块保护，建议采用硬件复位，取消软件写保护以提高性能和减少磨损。

#### 新物料的支持和测试

因为写保护的存在，导致新物料适配更加复杂。

`uboot`: 烧录所用的 `uboot` 需要适配解锁操作。主要是在 `drivers/mtd/spi/spi-NOR-ids.c` 中给对应物料配置上 `SPI_NOR_HAS_LOCK`(支持写保护) 和 `SPI_NOR_INDIVIDUAL_LOCK`(块保护) 等标志，并实现对应的锁操作函数。

`rtos`: 添加新物料的支持，主要是添加 `struct NOR_info NOR_ids[]`：

```
struct NOR_info {
	char *name;
	unsigned char id[MAX_ID_LEN];
	unsigned int blk_size;
	unsigned int blk_cnt;

	struct NOR_protection *pt;
	unsigned int pt_len;
	unsigned int pt_def;

	int flag;
 #define EN_IO_PROG_X4 BIT(1)
 #define EN_IO_READ_X2 BIT(2)
 #define EN_IO_READ_X4 BIT(3)
 #define EN_INDIVIDUAL_PROTECT_MODE BIT(4)
};
```

如果不考虑写保护，只需要把前4项根据 SPEC 信息填写即可。其中blk_size对应文件系统的块大小，因此建议设置为4096，因此 `blk_cnt` 就是NOR总大小除以4096。

pt，pt_len和pt_def适用于区间保护。由于不再推荐使用区间保护，因此不展开介绍。

flag通过设置 `EN_INDIVIDUAL_PROTECT_MODE BIT` 以支持独立块保护。

**在新物料适配后，需要进行大量压测，以确保足够稳定**

### SPI NAND

SPINAND的物理特性比 SPINOR 复杂，对驱动要求更高。RTOS 通过适配全志自研的NFTL，实现在 RTOS 上支持SPINAND。

NFTL实现只提供静态库，结合已经开源的物理层代码，即可在 RTOS 上支持SPINAND。

## eMMC / SD Card / SD Nand 驱动

eMMC / SD Card / SD Nand 使用的是标准的 SDIO 接口，BROM 支持从支持的 MMC 储存器启动。支持 TF 卡启动，eMMC 启动，SD Nand 启动，也支持通过 SDIO 读取相关存储设备的数据。
