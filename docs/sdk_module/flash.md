# Flash Controller

Flash Controller 为 R128 内置的一个 Nor Flash 读写控制器，用于控制命令的收发、数据读写和执行 XIP，兼容 Standard SPI/Dual SPI/Quad SPI。R128 既可以通过 SPI 控制器与Nor Flash 芯片通讯，也可以通过 Flash 控制器与之通讯。在 Flash Controller 前一级加入了 Flash Encryption 模块。Flash Encryption 模块在向Flash 写数据时进行 AES 加密，从 Flash 中读数据时进行解密。Flash Controller 与 Flash Encryption 组合称为 FlashC_Enc。

## 模块介绍

FlashC_Enc 的主要特性如下：

- 支持不同时钟频率，最大支持 96MHz
- 支持 SPI 1/2/4 线收发，支持 SPI Model 0/1/2/3
- 可灵活配置 4 段虚拟地址区间，支持 DMA 读写、Nor Flash XIP 操作
- 最大 2ˆ32Bytes 容量的 Nor Flash，常见有 64Mb，128Mb，256Mb
- 可对 Flash 进行加密，最大可配置 6 段独立的加密区间
- 支持在读写数据时进行实时 AES 加解密

## 模块配置

```
Drivers Options --->
    soc related device drivers --->
        FlashControler Devices --->
            [*] enable flashc driver           # FlashC 驱动，选中表示使用 FlashC 与 Flash 通讯
            [*] enable flashc test command     # FlashC 测试用例，测试 FlashC 相关功能
            [*] enable flashc xip              # 支持 XIP
            [*] enable flashc enc              # FlashEnc 驱动，需要加密功能时选中
            [*] enable flash enc hal APIs test command # FlashEnc 测试用例，测试 FlashEnc 相关功能
```

## 源码结构

FlashC_Enc 模块源码结构如下所示：

```
rtos-hal/
|--hal/source/flash_mcu/hal_flashctrl_rom.c   // FlashC相关驱动
|--hal/source/flash_mcu/hal_flashctrl.h       // FlashC相关驱动头文件
|--hal/source/flash_mcu/hal_flash_rom.c       // Flash 初始化、读写相关API
|--hal/source/flash_mcu/hal_flash.h           // Flash 初始化、读写相关API头文件
|--hal/source/flash_mcu/flashchip/            // Flash 芯片相关驱动
|--hal/source/flashc/hal_flashc_enc.c         // FlashEnc相关API
|--include/hal/hal_flashc_enc.h               // 头文件
```

## 模块接口说明

###  Flash_Init 接口

先初始化 FlashC 控制器模块，然后初始化 NOR Flash

```c
HAL_Status HAL_Flash_Init(uint32_t flash, FlashBoardCfg *cfg)
```

参数：

- flash：Flash 设备号，即 g_flash_cfg 结构体数组索引
- cfg：Flash 设备的板级配置信息，即 g_flash_cfg 结构体数组

返回值：

- HAL_OK：代表成功
- HAL_ERROR：错误
- HAL_BUSY：设备忙
- HAL_TIMEOUT：超时
-  HAL_INVALID：无效参数

### Flash_Deinit 接口

反初始化

```c
HAL_Status HAL_Flash_Deinit(uint32_t flash, FlashBoardCfg *cfg)
```

参数：

- flash：Flash 设备号，即 g_flash_cfg 结构体数组索引
- cfg：Flash 设备的板级配置信息，即 g_flash_cfg 结构体数组

返回值：

- HAL_OK：代表成功

###  Flash_Open 接口

打开一个 Flash 设备，拿互斥锁，如果已经打开则无法再打开。

```c
HAL_Status HAL_Flash_Open(uint32_t flash, uint32_t timeout_ms)
```

参数：

- flash：Flash 设备号，即 g_flash_cfg 结构体数组索引
- timeout_ms：等待打开 Flash 的时间，单位 ms

返回值：

- HAL_OK：代表成功

###  Flash_Close 接口

关闭一个 Flash 设备，释放互斥锁

```c
HAL_Status HAL_Flash_Close(uint32_t flash)
```

参数：

- flash：Flash 设备号，即 g_flash_cfg 结构体数组索引

返回值：

- HAL_OK：代表成功

### Flash_Read 接口

从 Flash 中读取指定长度的数据

```c
HAL_Status HAL_Flash_Read(uint32_t flash, uint32_t addr, uint8_t *data, uint32_t size)
```

参数：

- flash：Flash 设备号，即 g_flash_cfg 结构体数组索引
- addr：读取的起始地址
- data：读到的数据存放地址
- size：读数据长度

返回值：

-  HAL_OK：代表成功

###  Flash_Write 接口

写一段数据到 Flash 中指定的地址，写之前需要确保该区间已经被擦除过

```c
HAL_Status HAL_Flash_Write(uint32_t flash, uint32_t addr, const uint8_t *data, uint32_t size)
```

参数：

- flash：Flash 设备号，即 g_flash_cfg 结构体数组索引
-  addr：要写入的起始地址
- data：要写的数据存放地址
- size：写数据长度

返回值：

- HAL_OK：代表成功

### Flash_Overwrite 接口

写一段数据到 Flash 中指定的地址，写之前不需要关心该区间是否已经被擦除过（只在4K 擦除模式有效）

```c
HAL_Status HAL_Flash_Overwrite(uint32_t flash, uint32_t addr, const uint8_t *data, uint32_t size)
```

参数：

- flash：Flash 设备号，即 g_flash_cfg 结构体数组索引
- addr：要写入的起始地址
- data：要写的数据存放地址
- size：写数据长度

返回值：

- HAL_OK：代表成功

###  Flash_erase 接口

擦除 Flash 中指定地址和大小的区间，擦除地址需要与擦除大小对齐。

```c
HAL_Status HAL_Flash_Erase(uint32_t flash, FlashEraseMode blk_size, uint32_t addr, uint32_t blk_cnt)
```

参数：

- flash：Flash 设备号，即 g_flash_cfg 结构体数组索引
- blk_size：擦除大小，如 4k/32k/64k/chip
- addr：擦除的起始地址
- blk_cnt：需要擦除的扇区块数

返回值：

- HAL_OK：代表成功

### Flash_Ioctl 接口

擦除 Flash 中指定地址和大小的区间，擦除地址需要与擦除大小对齐。

```c
HAL_Status HAL_Flash_Ioctl(uint32_t flash, FlashControlCmd attr, uint32_t arg)
```

参数：

- flash：Flash 设备号，即 g_flash_cfg 结构体数组索引
- attr：功能操作行为类型
- arg：实际功能的参数

返回值：

- HAL_OK：代表成功

###  Flash_MemoryOf 接口

计算输入地址所处的可擦除 Block 首地址

```c
HAL_Status HAL_Flash_MemoryOf(uint32_t flash, FlashEraseMode size, uint32_t addr, uint32_t *start)
```

参数：

- flash：Flash 设备号，即 g_flash_cfg 结构体数组索引
- addr：要擦除的起始地址
- start：返回的 Block 首地址

返回值：

- HAL_OK：代表成功

### Flash_Check 接口

检查被写区域是否需要先擦除

```c
int HAL_Flash_Check(uint32_t flash, uint32_t addr, uint8_t *data, uint32_t size)
```

参数：

- flash：Flash 设备号，即 g_flash_cfg 结构体数组索引
- addr：要写入的起始地址
- data：要写的数据存放地址
- size：写数据长度

返回值：

- -1：检查失败
- 0：数据相同，不需要擦写
- 1：可直接写，不需要擦除
- 2：需要先擦除再写

###  Flash_Enc 初始化接口

初始化 Flash_Enc 模块

```c
int hal_flashc_enc_init(uint32_t max_addr)
```

参数：

- max_addr：对应 Flash 的最大容量
- addr：要擦除的起始地址
- start：返回的 Block 首地址

返回值：

- 0：代表成功
- -1：失败

###  Flash_Enc 申请加密通道接口

申请一个加密通道，Flash_Enc 支持最多 6 段加密区间的设置，一个通道代表一个区间，对某个 Flash 区间设置加密前需先申请一个通道。

```c
int hal_flashc_enc_alloc_ch(void)
```

参数：

- 无

返回值：

- 0~5：申请到的加密通道号
- -1：失败

### Flash_Enc 设置加密接口

对一个 Flash 区间进行加密设置。

```c
int hal_set_flashc_enc(const Flashc_Enc_Set *enc_set)
```

参数：

- enc_set：加密配置，如起始地址、密钥等

返回值：

- 0：代表成功
- -1：失败

### Flash_Enc 使能加密接口

使能一个加密区间。

```c
int hal_flashc_enc_enable(const Flashc_Enc_Set *enc_set)
```

参数：

- enc_set：加密配置，如起始地址、密钥等

返回值：

-  0：代表成功
- -1：失败

###  Flash_Enc 失能加密接口

失能一个加密区间。

```c
int hal_flashc_enc_disable(const Flashc_Enc_Set *enc_set)
```

参数：

- enc_set：加密配置，如起始地址、密钥等

返回值：

- 0：代表成功
- -1：失败

## 模块使用范例

###  SPI Flash 擦写读示例

FlashC 模块的初始化、Flash 参数配置等在 `flashc_nor_init()` 中通过调用 `HAL_Flash_Init()` 完成，这里简单展示对 SPI Nor Flash 的擦写读操作：

```c
static int flash_api_test(void)
{
    u8 read_buf[128], write_buf[128], i;
    uint32_t addr = 0, size = sizeof(write_buf);
    int ret;
    HAL_Status status = HAL_ERROR;
    
    for(i = 0; i < size ;i++)                  // 准备测试数据
    	write_buf[i] = i;
    
    status = HAL_Flash_Open(0, 5000);          // 开启设备
    if (status != HAL_OK) {
    	printf("open %u fail\n", 0);
    	return status;
    }
    status = HAL_Flash_Erase(0 , FLASH_ERASE_4KB, addr, 1);  // 擦除，对齐4K
    if (status != HAL_OK) {
    	printf("erase %u fail\n", 0);
    	return status;
    } 
    status = HAL_Flash_Write(0 , addr, write_buf, size);     // 写入数据
    if (status != HAL_OK) {
    	printf("erase %u fail\n", 0);
    	return status;
    }
    memset(read_buf, 0, size);
    status = HAL_Flash_Read(0 , addr, read_buf, size);       // 读取数据
    
    if (status != HAL_OK) {
    	printf("erase %u fail\n", 0);
    	return status;
    }
    
    HAL_Flash_Close(0);                         // 关闭设备
    if (status != HAL_OK) {
    	printf("close %u fail\n", 0);
    	return status;
    }
    
    ret = memcmp(write_buf, read_buf, size);    // 对比数据
    if (ret != 0) {
    	printf("\tresult: err\n");
    } else {
    	printf("\tresult: ok\n");
    }
    return ret;
}
```

### 对 Flash 进行加密

```c
int user_enc_api_test(void)
{
    Flashc_Enc_Set enc_set;
    Flashc_Enc_Config *enc_cfg = get_flashc_enc_cfg();
    enc_set.ch = hal_flashc_enc_alloc_ch();
    
    if (enc_set.ch < 0) {
    	ENC_ERR("err: alloc channel failed.\n");
    	return -1;
    }
    
    enc_set.start_addr = 0x800000;    // Flash加密区间物理起始地址
    enc_set.end_addr = 0x900000;      // Flash加密区间物理结束地址
    enc_set.key_0 = 0x12345678;       // 密钥
    enc_set.key_1 = 0x12345678;       // 密钥
    enc_set.key_2 = 0x12345678;       // 密钥
    enc_set.key_3 = 0x12345678;       // 密钥
    enc_set.enable = 1;
    hal_set_flashc_enc(&enc_set);
}
```

请注意：

- 在开启XIP功能时，若对Flash的物理区间0x800000-0x900000开启加密时，需要对 XIP 访问的对应虚拟地址区间也进行相应的加密设置。虚拟地址区间的加密，是调用 `hal_flashc_enc_alloc_ch`v时自动分配和设置的，不需要用户另外申请和设置。

## XIP 配置和使用

为了执行存放在 Nor Flash 中的代码，我们需要配置开启 XIP 功能支持。

1. 执行 `menuconfig` 选中 XIP

```c
Drivers Options --->
    soc related device drivers --->
        FlashControler Devices --->
            [*] enable flashc xip
```

2. 编辑 `sys_partition_xip.fex` 增加 xip 分区：

```ini
[partition]
    name = rtos-xip
    size = 1600
    downloadfile = "rtos_xip_arm.fex"
    user_type = 0x8000
```

3. 编辑 ` image_header_xip.cfg` 增加

```json
{"id": "0xa5e05a01", "bin": "rtos_xip_arm.fex", "attr": "0x02"},
```

4. 编辑 `freerrtos.lds.S`，将代码放在 xip 段：

```c
#if (defined(CONFIG_XIP))
    .xip :
    {
        . = ALIGN(16);
        __xip_start__ = .;
        ...
        *(.xip_text* .xip_rodata*)
        . = ALIGN(16);
        __xip_end__ = .;
    } > FLASH
#endif /* CONFIG_XIP */
```

> 不可将中断中访问的资源放在 XIP 中，包括中断处理函数中调用到的函数、字符串常量等，否则在 Flash 擦写期间，XIP 不能访问，此时若发生中断，将造成系统卡死。此外，在 XIP 未初始化时，也不能访问 Flash 中的代码。

5. XIP 代码检查确认。当执行以上步骤时，可查看 map 文件来确认是否达到预期效果：

```shell
.xip 	0x0000000010000000 		0x69840
		0x0000000010000000 		. = ALIGN (0x10)
		0x0000000010000000 		__xip_start__ = .
*build/r128_evb1_m33/components/aw/iobox/rm.o(.text .text.* .rodata .rodata.*)
...
```

## 添加新的 Flash 芯片支持

新的 Flash 芯片分为两类：一类是该芯片的命令与 `flash_default.c` 实现的接口一致，为 Default Flash Chip 类型，只需要简单配置即可支持该 Flash 芯片，参见 “Default Flash Chip“ 支持。另一类是该芯片的命令与 `flash_default.c` 实现的接口不一致或不完全一致，该芯片为非 Default Flash Chip 类型，则需要进行对应接口的重写，参见 “非 Default Flash Chip“ 支持。已支持的 Flash 芯片可以通过 `rtos-hal/hal/source/flash_mcu/flashchip/flash_chip_cfg.c`进行确认。

###  Default Flash Chip 支持

通过扩展 `simpleFlashChipCfg` 数组实现，在数组里增加 `FlashChipCfg` 结构体类型的元素，并根据 Flash 芯片的 Data Sheet 获取相关参数，配置好该结构体。（`simpleFlashChipCfg` 数组在 `rtos-hal/hal/source/flash_mcu/flashchip/flash_chip_cfg.c` 定义）

FlashChip 部分成员如下：

| 参数                |                                                              |
| ------------------- | ------------------------------------------------------------ |
| mJedec              | Flash 的 jedec ID，24bit                                     |
| mSize               | 芯片的存储容量，如32Mbit                                     |
| mEraseSizeSupport   | 芯片支持哪些擦除命令，如 4K、32K、64K、全片擦除              |
| mPageProgramSupport | 芯片支持哪些烧写命令，如 FLASH_PAGEPROGRAM、FLASH_QUAD_PAGEPROGRAM |
| mReadStausSupport   | 芯片支持读哪些状态寄存器，如 FLASH_STATUS1 、FLASH_STATUS2、FLASH_STATUS3 |
| mWriteStatusSupport | 芯片支持写哪些状态寄存器，如 FLASH_STATUS1 、FLASH_STATUS2、FLASH_STATUS3 |
| mReadSupport        | 芯片支持哪些读命令，如 FLASH_READ_NORMAL_MODE 、FLASH_READ_FAST_MODE、FLASH_READ_DUAL_O_MODE、FLASH_READ_DUAL_IO_MODE、FLASH_READ_QUAD_O_MODE 、FLASH_READ_QUAD_IO_MODE |
| mMaxFreq            | 除了 READ 命令以外，其他命令允许的最高频率                   |
| mMaxReadFreq        | READ 命令的最高频率                                          |
| mSuspendSupport     | 表示是否支持擦/写暂停，1 表示支持，0 表示不支持              |
| mSuspend_Latency    | 发送暂停命令后需要等待的最小延时                             |
| mResume_Latency     | 发送恢复命令后需要等待的最小延时                             |

下面以 winbond 的 W25Q128BV 为例：

```c
{
    .mJedec = 0x1840ef,
    .mSize = 16*1024*1024,
    .mEraseSizeSupport = FLASH_ERASE_64KB | FLASH_ERASE_32KB |
    					 FLASH_ERASE_4KB | FLASH_ERASE_CHIP,
    .mPageProgramSupport = FLASH_PAGEPROGRAM,
    .mReadStausSupport = FLASH_STATUS1 | FLASH_STATUS2 | FLASH_STATUS3,
    .mWriteStatusSupport = FLASH_STATUS1 | FLASH_STATUS2 |FLASH_STATUS3,
    .mReadSupport = FLASH_READ_NORMAL_MODE | FLASH_READ_FAST_MODE |
    				FLASH_READ_DUAL_O_MODE| FLASH_READ_DUAL_IO_MODE |
    				FLASH_READ_QUAD_O_MODE | FLASH_READ_QUAD_IO_MODE,
    .mContinuousReadSupport = FLASH_CONTINUOUS_READ_SUPPORT,
    .mBurstWrapReadSupport = FLASH_BURST_WRAP_16B,
    .mMaxFreq = 100 * 1000 * 1000,
    .mMaxReadFreq = 100 * 1000 * 1000,
    .mSuspendSupport = 0,
    .mSuspend_Latency = 0,
    .mResume_Latency = 0,
}
```

###  非 Default Flash Chip 支持

这里以 P25Q16H 为例，通过 data sheet 我们了解到这款芯片的绝大部命令实现与我们的 `flash_default.c` 接口实现一致，但是 `status` 寄存器的写命令与 `flash_default.c` 接口有差别，需要重新实现 `writeStatus` 接口。首先创建一个`flash_P25QXXH.c` 文件，通过 `Flash chip jedec` 值确定使用的芯片型号，然后具体配置特定的参数（如 Flash 的大小、支持的读写操作等），就可以实现代码复用。

```c
FlashChipCtor P25Q16H_FlashChip = {
    .mJedecId = P25Q16H_JEDEC,
    .enumerate = P25QXXH_FlashCtor,
    .init = P25QXXH_FlashInit,
    .destory = P25QXXH_FlashDeinit,
};
```

P25QXXH 芯片 `FlashChipCfg` 配置：

```c
static const FlashChipCfg _P25QXXH_FlashChipCfg = {
	.mJedec = P25Q40H_JEDEC,
	.mSize = 16 * 8 * 4096,
    .mEraseSizeSupport = FLASH_ERASE_64KB | FLASH_ERASE_32KB | FLASH_ERASE_4KB |
						 FLASH_ERASE_CHIP,
	.mPageProgramSupport = FLASH_PAGEPROGRAM | FLASH_QUAD_PAGEPROGRAM,
	...
};
```

创建 P25QXXH 系列芯片实例：

```c
static struct FlashChip *P25QXXH_FlashCtor(struct FlashChip *chip, uint32_t arg)
{
    uint32_t jedec = arg;
    uint32_t size;
    PCHECK(chip);
    if (jedec == P25Q64H_JEDEC) {
    	size = 8 * 1024 * 1024;
    } else if (jedec == P25Q32H_JEDEC) {
    	size = 4 * 1024 * 1024;
    } else if (jedec == P25Q16H_JEDEC) {
    	size = 2 * 1024 * 1024;
    } else if (jedec == P25Q80H_JEDEC) {
    	size = 1 * 1024 * 1024;
    } else if (jedec == P25Q40H_JEDEC) {
    	size = 512 * 1024;
    } else {
    	return NULL;
    }
    memcpy(&chip->cfg, &_P25QXXH_FlashChipCfg, sizeof(FlashChipCfg));
    chip->cfg.mJedec = jedec;
    chip->cfg.mSize = size;
    ...
    return chip;
}
```

写状态寄存器函数重写：

```c
static int P25QXXH_WriteStatus(struct FlashChip *chip, FlashStatus reg, uint8_t *status)
{
    int ret;
    uint8_t status_buf[2];
    InstructionField instruction[2];
    PCHECK(chip);
    
    if (!(reg & chip->cfg.mWriteStatusSupport)) {
    	FLASH_NOTSUPPORT();
    	return HAL_INVALID;
    }
    memset(&instruction, 0, sizeof(instruction));
    if (reg == FLASH_STATUS1) {
        if ((chip->cfg.mJedec & 0xFF0000) < 0x160000) {
            FCI_CMD(0).data = FLASH_INSTRUCTION_RDSR2;
            FCI_CMD(0).line = 1;
            FCI_DATA(1).pdata = (uint8_t *)&status_buf[1];
            FCI_DATA(1).len = 1;
            FCI_DATA(1).line = 1;
            chip->driverRead(chip, &FCI_CMD(0), NULL, NULL, &FCI_DATA(1));
        }
        ....
    chip->writeDisable(chip);
    return ret;
}
```

添加 `writestatus` 函数的挂载以及其他函数复用 `flash_default.c` 的接口：

```c
static int P25QXXH_FlashInit(struct FlashChip *chip)
{
    PCHECK(chip);
    chip->writeEnable = defaultWriteEnable;
    chip->writeDisable = defaultWriteDisable;
    chip->readStatus = defaultReadStatus;
    chip->erase = defaultErase;
    chip->jedecID = defaultGetJedecID;
    chip->pageProgram = defaultPageProgram;
    chip->read = defaultRead;
    chip->driverWrite = defaultDriverWrite;
    chip->driverRead = defaultDriverRead;
    chip->xipDriverCfg = defaultXipDriverCfg;
    chip->setFreq = defaultSetFreq;
    chip->switchReadMode = defaultSwitchReadMode;
    chip->enableXIP = defaultEnableXIP;
    chip->disableXIP = defaultDisableXIP;
    chip->isBusy = defaultIsBusy;
    chip->control = defaultControl;
    chip->minEraseSize = defaultGetMinEraseSize;
    ...
    return 0;
}
```

最后在 `flash_chip.c` 的 `flashChipList` 里补充 `P25Q16H_FlashChip` 就完成了扩展。

```c
FlashChipCtor *flashChipList[] = {
    #ifdef FLASH_DEFAULTCHIP
    	&DefaultFlashChip, /*default chip must be at the first*/
    #endif
    	...
    #ifdef FLASH_P25Q16H
    	&P25Q16H_FlashChip,
    #endif
};
```

