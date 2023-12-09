# HW Spinlock

## 模块介绍

hwspinlock 提供一种硬件同步机制，lock 操作可以防止多处理器同时处理共享数据。保证数据的一致性。

## 源码结构

```
├── hal_hwspinlock.c
├── hwspinlock.h
├── Kconfig
├── Makefile
├── platform
│   ├── hwspinlock-sun20iw2.h 
└── platform-hwspinlock.h
```

## 模块配置

配置路径如下:

```
There is no help available for this option. Symbol: DRIVERS_HWSPINLOCK [=y]
Type : boolean
Prompt: enable hwspinlock driver
Location:
	-> Drivers options
		-> Supported drivers
			-> HW SPINLOCK Devices
```

## 模块接口说明

头文件：

```c
#include <hal_hwspinlock.h>
```

### 获取锁

函数原型

```
int hal_hwspinlock_get(int num)
```

参数：

- `num`：`0~31`，hwspinlock 锁的序号

返回值：

- `HWSPINLOCK_OK`：上锁完成
- `HWSPINLOCK_EXCEED_MAX`：锁已达最大值，获取失败
- `HWSPINLOCK_ERR`：上锁失败

### 解锁

函数原型

```
int hal_hwspinlock_put(int num)
```

参数：

- `num`：`0~31`，hwspinlock 锁的序号

返回值：

- `HWSPINLOCK_OK`：上锁完成
- `HWSPINLOCK_EXCEED_MAX`：锁已达最大值，获取失败

### 检查锁是否在使用中

函数原型

```
int hal_hwspinlock_check_taken(int num)
```

参数：

- `num`：`0~31`，hwspinlock 锁的序号

返回值

- 1：使用中
- 0：未被使用

## 模块使用范例

```c
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include <unistd.h>
#include <hal_log.h>
#include <hal_cmd.h>
#include <hal_hwspinlock.h>

static int cmd_test_hwspinlock_get(int argc, char **argv)
{
	hal_hwspinlock_get(0);
	return 0;
}

static int cmd_test_hwspinlock_put(int argc, char **argv)
{
    hal_hwspinlock_put(0);
    return 0;
}

FINSH_FUNCTION_EXPORT_CMD(cmd_test_hwspinlock_get, hal_hwspinlock_get, test_hwspinlock)
FINSH_FUNCTION_EXPORT_CMD(cmd_test_hwspinlock_put, hal_hwspinlock_put, test_hwspinlock)
```

在 FreeRTOS 控制台输入 `hal_hwspinlock_get` 命令会上锁，输入 `hal_hwspinlock_put` 命令会解锁。
