# SID

## 模块介绍

SID 模块主要用于烧写 SoC 的 efuse。efuse 包括 ChipID、HASH 码等相关信息。该模块特点如下：

- efuse 一根熔丝只能被编程一次，并且具有一次可编程存储器的特点。
- 包含 SID_SRAM，SID_SRAM 在每次芯片上电时会备份 efuse 信息。
- SID 模块寄存器是非安全的；efuse 有安全非安全区分。
- 提供芯片唯一ID ChipID，出厂前会烧录好
- （secure enable bit ）作为 efuse 中安全开启开关，使能后，芯片会变成安全芯片

## 模块配置

```
Kernel Setup --->
    Drivers Setup --->
        SoC HAL Drivers --->
            SID devices --->
                [*] enable efuse driver
```

## 源码结构

SID 驱动位于 `hal/source/efuse/` 目录下。

```c
hal
├── source
│   ├── efuse
│ │ ├── efuse.c # SID底层驱动文件
│ │ ├── efuse.h # SID底层驱动头文件
│ │ ├── hal_efuse.c # SID公用操作接口函数文件
│ │ ├── Kconfig
│ │ ├── Makefile
│ │ ├── platform
│ │ │   ├── efuse_sun20iw2.h # 具体的平台配置头文件
│ │ └── platform_efuse.h # 平台配置头文件
└── include
    └── hal
        └── sunxi_hal_efuse.h # SID公用操作接口函数头文件
```

## 模块接口说明

头文件

```c
#include <sunxi_hal_efuse.h>
```

### efuse 写接口

将指定名字的数据写入 efuse

```c
int hal_efuse_write(char key_name, unsigned char key_data, size_t key_bit_len)
```

参数：

- key_name: efuse 区域名字
- key_data: 待写入数据
- key_bit_len: 待写入数据 bit 数

返回值：

- 0：成功
- 负数：失败



### efuse 读接口

读 efuse 中指定名字区域的数据

```c
int hal_efuse_read(char key_name, unsigned char key_data, size_t key_bit_len)
```

参数：

- key_name: efuse 区域名字
- key_data: 待读取数据
- key_bit_len: 待读取数据 bit 数

返回值：

- 0：成功
- 负数：失败



###  efuse 读扩展接口

读 efuse 中指定名字区域的数据

```c
int hal_efuse_read_ext(uint32_t start_bit, uint32_t bit_num, uint8_t *data)
```

参数：

- start_bit: efuse 区域名字
- bit_num: 待读取数据
- data: 存放待读取数据

返回值：

- 0：成功
- 负数：失败



### 开启 secure enable bit 接口

开启 secure enable bit

```c
int hal_efuse_set_security_mode(void)
```

参数：

- 无

返回值：

- 0：成功
- 负数：失败

> 开启 **efuse** 中 **secure enable bit** 之后，芯片会变成安全芯片，此过程不可逆，开启时请额外注意。

### 读取 secure enable bit 状态接口

读取 secure enable bit 状态

```c
int hal_efuse_get_security_mode(void)
```

参数：

- 无

返回值：

- 0：没有烧写
- 1：烧写了



### 读取 chipid 接口

读取 efuse 中 chipid

```c
int hal_efuse_get_chipid(unsigned char *buffer)
```

参数：

- buffer: 用于存放 chipid 数据的指针

返回值：

- 0：成功
- 负数：失败



### 读取 thermal 校准值接口

读取 thermal sensor 校准值

```c
int hal_efuse_get_thermal_cdata(unsigned char *buffer)
```

参数：

- buffer: 存放读取的数据的指针

返回值：

- 0：成功
- 负数：失败



### 读取芯片版本接口

读取芯片版本信息

```c
int hal_efuse_get_chip_ver(void)
```

参数：

- 无

返回值：

-  正数：芯片版本号
- 负数：失败



### 读取 efuse sram 接口

读取 efuse sram 中数据

```c
int hal_get_module_param_from_sid(uint32_t *dst, uint32_t offset, uint32_t len)
```

参数：

- dst: 存放读取的数据
- offset: 读取的偏移
- len: 读取长度（字节）

返回值：

- 0：成功
- 负数：失败

## 模块使用范例

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include <hal_cmd.h>
#include <sunxi_hal_efuse.h>

#undef  HEXDUMP_LINE_CHR_CNT
#define HEXDUMP_LINE_CHR_CNT 16

static int sunxi_hexdump(const unsigned char *buf, int bytes)
{
    unsigned char line[HEXDUMP_LINE_CHR_CNT] = {0};
    int addr;

    for (addr = 0; addr < bytes; addr += HEXDUMP_LINE_CHR_CNT)
    {
        int len = ((bytes-addr)<HEXDUMP_LINE_CHR_CNT ? (bytes-addr) : HEXDUMP_LINE_CHR_CNT);
	int i;

        memcpy(line, buf + addr, len);
        memset(line + len, 0, HEXDUMP_LINE_CHR_CNT - len);

        /* print addr */
        printf("0x%.8X: ", addr);
        /* print hex */
        for (i = 0; i < HEXDUMP_LINE_CHR_CNT; i++)
        {
            if (i < len)
            {
                printf("%.2X ", line[i]);
            }
            else { printf("   "); }
        }
        /* print char */
        printf("|");
        for (i = 0; i < HEXDUMP_LINE_CHR_CNT; i++)
        {
            if (i < len)
            {
                if (line[i] >= 0x20 && line[i] <= 0x7E)
                {
                    printf("%c", line[i]);
                }
                else
                {
                    printf(".");
                }
            }
            else
            {
                printf(" ");
            }
        }
        printf("|\n");
    }
    return 0;
}

int cmd_test_efuse(int argc, char **argv)
{
	char buffer[32] = {0};

	hal_efuse_get_chipid(buffer);
	sunxi_hexdump(buffer, sizeof(buffer));

	printf("===================================\n");
	printf("Test Finished.\n");

	return 0;
}

FINSH_FUNCTION_EXPORT_CMD(cmd_test_efuse, hal_efuse, efuse hal APIs tests)
```

