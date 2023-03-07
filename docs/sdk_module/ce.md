# Crypto Engine

## 模块介绍

CE 模块主要支持对称算法、非对称算法、摘要算法进行数据的加密和解密功能。

CE 模块主要支持的算法如下：

- AES 算法 ECB/CBC/CTR/CTS/OFB/CFB/CBC-MAC/XTS 等模式.
- HASH 算法 MD5/SHA1/SHA224/SHA256/SHA384/SHA512/HMAC-SHA1/HMAC-SHA256.
- 非对称算法 RSA512/1024/2048/3072/4096.

## 模块配置

其menuconfig 的配置如下：

```shell
Kernel Setup --->
    Drivers Setup --->
        SoC HAL Drivers --->
            CE devices --->
                [*] enable ce driver
                [*] enbale ce hal APIs Test command
```

## 源码结构

CE 驱动位于 `source/drivers/hal/source/ce/` 目录下。

```
hal/
├── source
│ ├── ce
│ │ ├── ce_common.c    # CE公用操作接口函数文件
│ │ ├── ce_common.h    # CE操作接口函数头文件
│ │ ├── hal_ce.c       # CE底层驱动文件
│ │ ├── hal_ce.h       # CE底层驱动头文件
│ │ ├── Makefile
│ │ └── platform.h     # 平台配置头文件
| ├── platform
│ └── ce_sun20iw2.h    # 具体的平台配置头文件
├── include/hal
  └── sunxi_hal_ce.h   # CE公用操作接口函数头文件
```

## 模块接口说明

头文件

```c
#include <sunxi_hal_ce.h>
```

### CE 初始化接口

CE 模块初始化，主要申请中断、clk 初始化等

函数原型：

```c
int sunxi_ce_init(void)
```

参数：

- 无

返回值：

- 0：成功
- 负数：失败