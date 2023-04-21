# TRNG 真随机数发生器

TRNG是真随机数发生器，随机源是8 路独立的环形振荡器，由模拟器件电源噪声产生频率抖动，用低频始终重采样，然后进行弹性抽取和熵提取处理，最终输出128bit真随机数。

## 模块配置

其 menuconfig 的配置如下：

```
Kernel Setup --->
    Drivers Setup --->
        SoC HAL Drivers --->
            TRNG devices --->
                [*] enable trng driver
                [*] enbale trng hal APIs Test command
```

## 源码结构

```
drv_trng.c
drv_trng.h
hal_trng.c
```

## 模块接口说明

头文件

```c
#include <sunxi_hal_trng.h>
```

### 返回值枚举

```c
typedef enum
{
    HAL_TRNG_STATUS_OK      = 0,	/* success */
    HAL_TRNG_STATUS_ERROR   = -1,	/* general error */
    HAL_TRNG_STATUS_BUSY    = -2,	/* device or resource busy */
    HAL_TRNG_STATUS_TIMEOUT = -3,	/* wait timeout */
    HAL_TRNG_STATUS_INVALID = -4	/* invalid argument */
} HAL_TRNG_Status;
```

### 获取随机数

函数原型

```c
HAL_TRNG_Status HAL_TRNG_Extract(uint8_t type, uint32_t random[4]);
```

参数：

- type：随机数生成熵提取模式（0：crc，1：xor）
- random：存放生成的随机数

返回值：

- 0：成功
- 负数：失败

## 模块使用范例

```c
#include <stdio.h>
#include <string.h>
#include <hal_log.h>
#include <hal_cmd.h>
#include <sunxi_hal_trng.h>

static int cmd_test_trng(int argc, const char **argv)
{
	int ret = 0;
	uint32_t random[4] = {0};

	if (argc != 2) {
		printf("Parameter number Error!\n");
		printf("Usage: hal_trng <crc|xor>\n");
		return -1;
	}

	if (strcmp(argv[1], "crc") == 0)
		ret = HAL_TRNG_Extract(0, random);
	else if (strcmp(argv[1], "xor") == 0)
		ret = HAL_TRNG_Extract(1, random);
	else {
		printf("Parameter Error!\n");
		printf("Usage: hal_trng <crc|xor>\n");
		ret = -1;
		return ret;
	}

	if (ret) {
		printf("trng extract failed: %d\n", ret);
		return ret;
	}

	printf("trng result: 0x%08x 0x%08x 0x%08x 0x%08x\n", random[0], random[1], random[2], random[3]);

	return ret;
}

FINSH_FUNCTION_EXPORT_CMD(cmd_test_trng, hal_trng, trng hal APIs tests)
```



