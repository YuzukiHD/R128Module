# UART

Universal Asynchronous Receiver/Transmitter，通用异步收发传输器

- Compatible with industry-standard 16450/16550 UARTs
- 64-Byte Transmit and receive data FIFOs
- Supports DMA controller interface
- Supports Software/ Hardware Flow Control
- Supports IrDA 1.0 SIR
- Supports RS-485 mode

## 模块配置

其menuconfig 的配置如下：

```shell
Kernel Setup --->
    Drivers Setup --->
        SoC HAL Drivers --->
            UART devices --->
                [*] enable uart driver
                [*] enbale uart hal APIs Test command
```

## 源码结构

```c
.
│  hal_uart.c         # 驱动源码
│  platform-uart.h    # 平台选择头文件
│  uart.h             # 驱动私有头文件
└─platform
        uart-sun20iw2p1.h # 平台特化定义
```

## 模块接口说明

头文件

```c
#include <hal_uart.h>
```

### 返回值枚举

```c
typedef enum
{
    HAL_UART_STATUS_ERROR_PARAMETER = -4,      /**< Invalid user input parameter. */
    HAL_UART_STATUS_ERROR_BUSY = -3,           /**< UART port is currently in use. */
    HAL_UART_STATUS_ERROR_UNINITIALIZED = -2,  /**< UART port has not been initialized. */
    HAL_UART_STATUS_ERROR = -1,                /**< UART driver detected a common error. */
    HAL_UART_STATUS_OK = 0                     /**< UART function executed successfully. */
} hal_uart_status_t;
```

### 波特率枚举

```c
typedef enum
{
    UART_BAUDRATE_300 = 0,
    UART_BAUDRATE_600,
    UART_BAUDRATE_1200,
    UART_BAUDRATE_2400,
    UART_BAUDRATE_4800,
    UART_BAUDRATE_9600,
    UART_BAUDRATE_19200,
    UART_BAUDRATE_38400,
    UART_BAUDRATE_57600,
    UART_BAUDRATE_115200,
    UART_BAUDRATE_230400,
    UART_BAUDRATE_576000,
    UART_BAUDRATE_921600,
    UART_BAUDRATE_1000000,
    UART_BAUDRATE_1500000,
    UART_BAUDRATE_3000000,
    UART_BAUDRATE_4000000,
    UART_BAUDRATE_MAX,
} uart_baudrate_t;
```

### UART 字长枚举

```c
typedef enum
{
    UART_WORD_LENGTH_5 = 0,
    UART_WORD_LENGTH_6,
    UART_WORD_LENGTH_7,
    UART_WORD_LENGTH_8,
} uart_word_length_t;
```

### UART 停止位枚举

```c
typedef enum
{
    UART_STOP_BIT_1 = 0,
    UART_STOP_BIT_2,
} uart_stop_bit_t;
```

### UART 奇偶枚举

```c
typedef enum
{
    UART_PARITY_NONE = 0,
    UART_PARITY_ODD,
    UART_PARITY_EVEN
} uart_parity_t;
```

### UART 配置结构体

```c
typedef struct
{
    uart_baudrate_t baudrate;
    uart_word_length_t word_length;
    uart_stop_bit_t stop_bit;
    uart_parity_t parity;
} _uart_config_t;
```

### 获取UART驱动的版本号

函数原型：

```c
sunxi_hal_version_t hal_uart_get_version(int32_t dev)
```

参数：

- dev：UART端口号

返回：

- UART 驱动版本号

### 初始化UART驱动

函数原型：

```c
int32_t hal_uart_init(int32_t uart_port);
```

参数：

- uart_port：UART 端口号

返回：

- 0：成功
- 负数：失败



### 初始化异构AMP UART控制台

函数原型：

```c
int32_t hal_uart_init_for_amp_cli(int32_t uart_port);
```

参数：

- uart_port：UART 端口号

返回：

- 0：成功
- 负数：失败



### 卸载UART驱动

函数原型：

```c
int32_t hal_uart_deinit(int32_t uart_port);
```

参数：

- uart_port：UART 端口号

返回：

- 0：成功
- 负数：失败



### 发送数据

函数原型：

```c
int32_t hal_uart_send(int32_t dev, const uint8_t *data, uint32_t num);
```

参数：

- dev：UART 端口号
- data：准备发送的数据buffer
- num：buffer 大小

返回：

- 成功发送的字节数



### 发送一个字符

函数原型：

```c
int32_t hal_uart_put_char(int32_t dev, char c);
```

参数：

- dev：UART 端口号
- c：待发送的字符

返回：

- 1：成功



### 接收数据

函数原型：

```c
int32_t hal_uart_receive(int32_t dev, uint8_t *data, uint32_t num);
```

参数：

- dev：UART 端口号
- data：接收数据缓冲区
- num：接收数据的大小

返回：

- size：接收到的数据大小



### 非阻塞接收数据

函数原型：

```c
int32_t hal_uart_receive_no_block(int32_t dev, uint8_t *data, uint32_t num, int32_t timeout);
```

参数：

- dev：UART 端口号
- data：接收数据缓冲区
- num：接收数据的大小
- timeout：超时时间

返回：

- size：接收到的数据大小



### 接收一个字符

函数原型：

```c
uint8_t hal_uart_get_char(int32_t dev);
```

参数：

- dev：UART 端口号

返回：

- 收到的字符值



### 设置 UART 工作参数

函数原型：

```c
int32_t hal_uart_control(int32_t uart_port, int cmd, void *args);
```

参数：

- uart_port：UART 端口号
- cmd：保留
- args:  指向 _uart_config_t 类型的结构体

返回：

- 0：成功
- 负数：失败



### 轮询接收

函数原型：

```c
int32_t hal_uart_receive_polling(int32_t dev, uint8_t *data, uint32_t num);
```

参数：

- dev：UART 端口号
- data：接收数据缓冲区
- num：接收数据的大小

返回：

- size：接收到的数据大小



### 查看轮询接收状态

函数原型：

```c
int32_t hal_uart_check_poll_state(int32_t dev_id, short key);
```

参数：

- dev_id：UART 端口号
- key：标志位，取值 POLLIN，POLLOUT，POLLERR

返回：

- UART 当前的接收状态



### 执行唤醒处理函数

函数原型：

```c
int32_t hal_uart_poll_wakeup(int32_t dev_id, short key);
```

参数：

- dev_id：UART 端口号
- key：标志位，取值 POLLIN，POLLOUT，POLLERR

返回：

- 回调函数执行返回值



### 注册唤醒处理函数

函数原型：

```c
int32_t hal_uart_register_poll_wakeup(poll_wakeup_func poll_wakeup);
```

参数：

- poll_wakeup：回调函数

返回：

- 0



### 设置硬件流控

函数原型：

```c
void hal_uart_set_hardware_flowcontrol(uart_port_t uart_port);
```

参数：

- uart_port：UART 端口号

返回：

- 无



### 禁用硬件流控

函数原型：

```c
void hal_uart_disable_flowcontrol(uart_port_t uart_port);
```

参数：

- uart_port：UART 端口号

返回：

- 无



### 设置 UART 回环

函数原型：

```c
void hal_uart_set_loopback(uart_port_t uart_port, bool enable);
```

参数：

- uart_port：UART 端口号
- enable：是否开启

返回：

- 无



### 使能 RX 中断

函数原型：

```c
int32_t hal_uart_enable_rx(int32_t uart_port);
```

参数：

- uart_port：UART 端口号

返回：

- 0



### 失能 RX 中断

函数原型：

```c
int32_t hal_uart_disable_rx(int32_t uart_port);
```

参数：

- uart_port：UART 端口号

返回：

- 0

## 模块使用范例

```c
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>

#include <hal_log.h>
#include <hal_cmd.h>
#include <hal_timer.h>
#include <hal_uart.h>

static void cmd_usage(void)
{
	printf("Usage:\n"
		"\t hal_uart <port> <baudrate>\n");
}

int cmd_test_uart(int argc, char **argv)
{
	uint8_t tbuf[6] = {"hello"};
	uint8_t rbuf[10] = {0};
	uart_port_t port;
	uint32_t baudrate;
	_uart_config_t uart_config;
	int i;

	hal_log_info("Testing UART in loopback mode");

	if (argc != 3) {
		cmd_usage();
		return -1;
	}

	port = strtol(argv[1], NULL, 0);
	baudrate = strtol(argv[2], NULL, 0);

	if(CONFIG_CLI_UART_PORT == port){
		hal_log_info("uart0 can't test, please use other port!");
		return -1;
	}
	memset(rbuf, 0, 10 * sizeof(uint8_t));

	switch (baudrate) {
	case 4800:
		uart_config.baudrate = UART_BAUDRATE_4800;
		break;

	case 9600:
		uart_config.baudrate = UART_BAUDRATE_9600;
		break;

	case 115200:
		uart_config.baudrate = UART_BAUDRATE_115200;
		break;

	case 1500000:
		uart_config.baudrate = UART_BAUDRATE_1500000;
		break;

	case 4000000:
		uart_config.baudrate = UART_BAUDRATE_4000000;
		break;
	default:
		hal_log_info("Using default baudrate: 115200");
		uart_config.baudrate = UART_BAUDRATE_115200;
		break;
	}

	uart_config.word_length = UART_WORD_LENGTH_8;
	uart_config.stop_bit = UART_STOP_BIT_1;
	uart_config.parity = UART_PARITY_NONE;

	hal_uart_init(port);
	hal_uart_control(port, 0, &uart_config);
	hal_uart_disable_flowcontrol(port);
	hal_uart_set_loopback(port, 1);

	/* send */
	hal_uart_send(port, tbuf, 5);

	/* loopback receive */
	hal_uart_receive_no_block(port, rbuf, 5, MS_TO_OSTICK(1000));

	printf("Sending:");
	for (i = 0; i < 5; i++)
		printf("%c", tbuf[i]);
	printf("\n");

	printf("Receiving:");
	for (i = 0; i < 5; i++)
		printf("%c", rbuf[i]);
	printf("\n");

	/* verify data */
	for (i = 0; i < 5; i++) {
		if (tbuf[i] != rbuf[i])
			break;
	}
	if (i == 5) {
		hal_log_info("Test hal_uart_init API success!");
		hal_log_info("Test hal_uart_control API success!");
		hal_log_info("Test hal_uart_disable_flowcontrol API success!");
		hal_log_info("Test hal_uart_set_loopback API success!");
		hal_log_info("Test hal_uart_send API success!");
		hal_log_info("Test hal_uart_receive API success!");
		hal_log_info("Test hal_uart_deinit API success!");
		hal_log_info("Test uart hal APIs success!");
	} else {
		hal_log_info("Test uart hal APIs failed!");
	}

	hal_msleep(1000);
	hal_uart_deinit(port);

	return 0;
}

FINSH_FUNCTION_EXPORT_CMD(cmd_test_uart, hal_uart, uart hal APIs tests)

#define BUFFSIZE 4096

static void cmd_stress_usage(void)
{
	printf("Usage:\n"
		"\t hal_uart <port> <baudrate> <flowctrl> <loopback> <len>\n");
}

int cmd_test_uart_stress(int argc, char **argv)
{
	uint8_t *tbuf = malloc(BUFFSIZE);
	uint8_t *rbuf = malloc(BUFFSIZE);
	uart_port_t port;
	uint32_t baudrate;
	_uart_config_t uart_config;
	int i;
	int flowctrl, loopback, testlen;

	hal_log_info("Testing UART in loopback mode with stress");

	if (argc != 6) {
		cmd_stress_usage();
		free(tbuf);
		free(rbuf);
		return -1;
	}

	port = strtol(argv[1], NULL, 0);
	baudrate = strtol(argv[2], NULL, 0);
	flowctrl = strtol(argv[3], NULL, 0);
	loopback = strtol(argv[4], NULL, 0);
	testlen = strtol(argv[5], NULL, 0);

	for (i = 0; i < BUFFSIZE; i++) {
		tbuf[i] = ('a' + i) & 0xff;
	}
	memset(rbuf, 0, BUFFSIZE * sizeof(uint8_t));

	switch (baudrate) {
	case 4800:
		uart_config.baudrate = UART_BAUDRATE_4800;
		break;

	case 9600:
		uart_config.baudrate = UART_BAUDRATE_9600;
		break;

	case 115200:
		uart_config.baudrate = UART_BAUDRATE_115200;
		break;

	case 1500000:
		uart_config.baudrate = UART_BAUDRATE_1500000;
		break;

	default:
		hal_log_info("Using default baudrate: 115200");
		uart_config.baudrate = UART_BAUDRATE_115200;
		break;
	}

	uart_config.word_length = UART_WORD_LENGTH_8;
	uart_config.stop_bit = UART_STOP_BIT_1;
	uart_config.parity = UART_PARITY_NONE;

	hal_uart_init(port);
	hal_uart_control(port, 0, &uart_config);
	printf("flow:%d, loopback:%d len:%d\n", flowctrl, loopback, testlen);
	if (flowctrl)
		hal_uart_set_hardware_flowcontrol(port);
	else
		hal_uart_disable_flowcontrol(port);

	if (loopback)
		hal_uart_set_loopback(port, 1);
	else
		hal_uart_set_loopback(port, 0);

	/* send */
	printf("send\n");
	hal_uart_send(port, tbuf, testlen);
	printf("send done\n");

	printf("recv\n");
	/* loopback receive */
	hal_uart_receive(port, rbuf, testlen);
	printf("recv done\n");

#if 0
	printf("Sending:");
	for (i = 0; i < testlen; i++) {
		if (i % 16 == 0)
			printf("\n");
		printf("0x%x ", tbuf[i]);
	}
	printf("\n");

	printf("Receiving:");
	for (i = 0; i < testlen; i++) {
		if (i % 16 == 0)
			printf("\n");
		printf("0x%x ", rbuf[i]);
	}
	printf("\n");
#endif

	/* verify data */
	for (i = 0; i < testlen; i++) {
		if (tbuf[i] != rbuf[i]) {
			printf("check %d fail, 0x%x != 0x%x\n", i, tbuf[i], rbuf[i]);
			break;
		}
	}
	if (i == testlen) {
		hal_log_info("Test hal_uart_init API success!");
		hal_log_info("Test hal_uart_control API success!");
		hal_log_info("Test hal_uart_disable_flowcontrol API success!");
		hal_log_info("Test hal_uart_set_loopback API success!");
		hal_log_info("Test hal_uart_send API success!");
		hal_log_info("Test hal_uart_receive API success!");
		hal_log_info("Test hal_uart_deinit API success!");
		hal_log_info("Test uart hal APIs success!");
	} else {
		hal_log_info("Test uart hal APIs failed!");
	}

	hal_msleep(1000);
	hal_uart_deinit(port);
	free(tbuf);
	free(rbuf);

	return 0;
}

FINSH_FUNCTION_EXPORT_CMD(cmd_test_uart_stress, hal_uart_stress, uart hal APIs tests)
```

