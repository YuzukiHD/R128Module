# LPUART

## 模块介绍

LPUART 驱动主要实现设备驱动的底层细节，并为上层提供一套标准的 API 接口以供使用。

## 模块配置

配置路径如下:

```
Kernel Setup --->
    Drivers Setup --->
        SoC HAL Drivers --->
            LPUART Devices --->
                [*] enable lpuart driver
```

## 源码结构

LPUART 模块源码结构如下所示：

```c
hal/source/lpuart/             ---- 驱动源码
├── hal_lpuart.c
├── Kconfig
├── Makefile
├── platform
│   ├── lpuart-sun20iw2p1.h    ---- 平台地址，引脚复用等配置
│   └── ...
├── platform-lpuart.h
└── lpuart.h
include/hal/                   ---- 驱动APIs声明头文件
└── hal_lpuart.h
```

## 模块接口说明

需要包含头文件

```c
#include <hal_lpuart.h>
```

### 初始化 LPUART 驱动

函数原型：

```c
int32_t hal_lpuart_init(int32_t lpuart_port)
```

参数：

- lpuart_port：LPUART 端口号

返回值：

- SUNXI_HAL_OK: 成功
- HAL_LPUART_STATUS_ERROR: 失败

### 卸载 LPUART 驱动

函数原型：

```c
int32_t hal_lpuart_deinit(int32_t lpuart_port)
```

参数：

- lpuart_port：LPUART 端口号

返回值：

- SUNXI_HAL_OK: 成功

### 设置波特率及参数

函数原型：

```c
int32_t hal_lpuart_control(lpuart_port_t lpuart_port, int cmd, void *args)
```

参数：

- lpuart_port_t：LPUART 端口号
- cmd：预留，暂未使用
- args：指向 _lpuart_config_t 类型变量的数组

返回值：

- SUNXI_HAL_OK: 成功
- HAL_LPUART_STATUS_ERROR: 失败

### 接收处理

函数原型：

```c
int32_t hal_lpuart_receive(int32_t dev, uint8_t *data, uint32_t num)
```

参数：

- dev：LPUART 端口号
- data: 接收数据缓冲区
- num: 接收数据长度

返回值：

- size: 成功接收的字节数

### 接收对比处理

函数原型：

```c
int32_t hal_lpuart_rx_cmp(lpuart_port_t lpuart_port, uint8_t cmp_len, uint8_t *cmp_data);
```

参数：

- lpuart_port：LPUART 端口号
- cmp_len：比较数据的长度
- cmp_data：比较的数据

返回值：

- SUNXI_HAL_OK: 成功
- HAL_LPUART_STATUS_ERROR: 失败

### 启用接收对比处理回调

函数原型：

```c
int32_t hal_lpuart_enable_rx_cmp(lpuart_port_t lpuart_port, lpuart_callback_t cb, void *arg);
```

参数：

- lpuart_port：LPUART 端口号
- cb：处理回调函数
- arg：回调函数的参数

返回值：

- SUNXI_HAL_OK: 成功
- HAL_LPUART_STATUS_ERROR: 失败

### 禁用接收对比处理回调

函数原型：

```c
int32_t hal_lpuart_disable_rx_cmp(lpuart_port_t lpuart_port);
```

参数：

- lpuart_port：LPUART 端口号

返回值：

- SUNXI_HAL_OK: 成功
- HAL_LPUART_STATUS_ERROR: 失败

### 配置PM绕过模式

函数原型：

```c
int32_t HAL_LPUART_SetBypassPmMode(lpuart_port_t lpuart_port, uint8_t mode);
```

参数：

- lpuart_port：LPUART 端口号
- mode：配置模式

返回值：

- SUNXI_HAL_OK: 成功
- HAL_LPUART_STATUS_ERROR: 失败

## 模块使用范例

```c
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include <hal_log.h>
#include <hal_cmd.h>
#include <hal_timer.h>
#include <hal_lpuart.h>
#include <hal_uart.h>

/* find a free uart_port or pc com as source */
#define UART_TEST UART_1
#define TEST_LEN 5

static void cmd_usage(void)
{
	printf("Usage:\n"
		"\t hal_lpuart <port> <baudrate>\n");
}

void test_recv_data(lpuart_port_t port)
{
	printf("enter recv data test\n");
	hal_lpuart_enable_rx_data(port, NULL, NULL);
	/* use uart as source */
	hal_uart_init(UART_TEST);
	hal_uart_send(UART_TEST, "a", 1);
	/* use pc com as source */
	printf("enter\n");
	hal_sleep(5);
	hal_lpuart_disable_rx_data(port);
}

static void compare_callback(void *arg)
{
	printf("data compare success!\n");
}

void test_cmp_data(lpuart_port_t port)
{
	printf("enter cmp data test\n");
	char cmp[TEST_LEN + 1] = "abcde";

	if (hal_lpuart_init(port)) {
		printf("lpuart %d not inited\n", port);
		return;
	}

	hal_lpuart_rx_cmp(port, TEST_LEN, cmp);
	hal_lpuart_enable_rx_cmp(port, compare_callback, NULL);
	/* use uart as source, stop bit of uart should be 2 */
	hal_uart_init(UART_TEST);
	hal_uart_send(UART_TEST, cmp, TEST_LEN);
	/* use pc com as source */
	printf("enter abcde\n");
	hal_sleep(5);
	hal_lpuart_disable_rx_cmp(port);
}

void lpuart_reset_multiplex()
{
	lpuart_multiplex(LPUART_0, UART_0);
	lpuart_multiplex(LPUART_1, UART_1);
}

int cmd_test_lpuart(int argc, char **argv)
{
	if (argc != 3) {
		cmd_usage();
		return -1;
	}

	lpuart_port_t port;
	uint32_t baudrate;

	port = strtol(argv[1], NULL, 0);
	baudrate = strtol(argv[2], NULL, 0);

	if (hal_lpuart_init(port) != SUNXI_HAL_OK) {
		printf("Fail to init lpuart\n");
		return -1;
	}

	if (port == 0) {
		lpuart_multiplex(LPUART_0, UART_TEST);
	} else if (port == 1) {
		lpuart_multiplex(LPUART_1, UART_TEST);
	}
	test_recv_data(port);
	test_cmp_data(port);

	lpuart_reset_multiplex();

	return 0;
}

FINSH_FUNCTION_EXPORT_CMD(cmd_test_lpuart, hal_lpuart, lpuart hal APIs tests)
```

