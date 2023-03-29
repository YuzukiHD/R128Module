# MSGBOX

msgbox 用来实现多 CPU 之间通讯，在一些 IC 内部可能同时存在多种核心用来实现多种不同功能，这些不同核心运行不同架构、不同系统，需要通过 MSGBOX 用来实现这些不同系统间通讯。

## 模块介绍

- msgbox 为一个双端 fifo 结构，cpu0 从一端写，cpu1 从一端读。
- rpmsg 为 linux 用来实现通讯的一种框架
- msgbox 为片上处理器之间提供了中断通讯机制

对于 R128 平台，CPU Remote ID如下

| CPU            | Remote ID |
| -------------- | --------- |
| ARM Cortex M33 | 0         |
| RISC-V C906    | 1         |
| HIFI5 DSP      | 2         |

## 模块配置

配置路径如下:

```
Kernel Setup --->
    Drivers Setup --->
        SoC HAL Drivers --->
            msgbox devices --->
                [*] enable msgbox driver
```

## 源码结构

```c
msgbox/
    ├── msgbox_amp            // msgbox AMP 实现
    │   ├── Makefile
    │   └── msgbox_amp.c        
    ├── platform              // 平台寄存器定义
    │   ├── msgbox-sun20iw2.h
    └── platform-msgbox.h     // 公共头文件
```

## 模块接口说明

头文件

```c
#include <hal_msgbox.h>
```

### 初始化接口 

函数原型：

```c
int32_t hal_msgbox_init(void);
```

参数：

- 无

返回值：

- 0：成功
- 负数：失败

### 通道申请接口

函数原型：

```c
uint32_t hal_msgbox_alloc_channel(struct msg_endpoint *edp, int32_t remote, int32_t read, int32_t write);
```

参数：

- edp：msgbox的端点
- remote：远端核心id
- read：读通道
- write：写通道

返回值：

- 0：成功
- 负数：失败

### 数据发送接口

函数原型：

```c
uint32_t hal_msgbox_channel_send(struct msg_endpoint *edp, uint8_t *bf, uint32_t len);
```

参数：

- edp：msgbox的端点
- bf：数据buffer
- len：buffer长度

返回值：

- 0：成功
- 负数：失败

### 通道释放接口

函数原型：

```c
void hal_msgbox_free_channel(struct msg_endpoint *edp);
```

参数：

- edp：msgbox的端点

返回值：

- 0：成功
- 负数：失败

### MSGBOX 申请流程

1. 使用hal_msgbox_alloc_channel接口申请 msgbox 通道
2. 填充msg_endpoint接收回调，这个会在 msgbox 的中断函数里调用
3. 通过hal_msgbox_channel_send进行数据发送
4. 接收通过中断的方式进行接收，会调用msg_endpoint的回调，无需主动调用

### MSGBOX 接收流程

1. 在接收函数里会首先遍历所有的msg_endpoint，判断当前终端是否有中断发送
2. irq_msgbox_channel_handler里会读取当前msg_endpoint的寄存器，来判断是否有中断，如果有，则读取数据
3. 退出中断

### MSGBOX 发送流程

1. 调用hal_msgbox_channel_send接口进行数据发送
2. msgbox_channel_send_data会判断是远端处理器是哪个，并且计算 local->remote 的系数 N 是多少，这个系数回存放在 to_coef_n 的表格里
3. 计算完成后往远端的 msgbox 的 fifo 中写数据
4. 发送完成

## 模块使用范例

```c
#include <FreeRTOS.h>
#include <queue.h>
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <unistd.h>
#include <string.h>
#include <awlog.h>
#include <hal_msgbox.h>

#include <console.h>

#define RECEIVE_QUEUE_LENGTH 16
#define RECEIVE_QUEUE_WAIT_MS 100

struct msgbox_demo {
	int remote_id;
	int read_ch;
	int write_ch;
	QueueHandle_t recv_queue;
};

static void print_help_msg(void)
{
	printf("\n");
	printf("USAGE:\n");
	printf("  hal_msgbox <REQUIRED_ARGUMENTS> [OPTIONS]\n");
	printf("\n");
	printf("REQUIRED_ARGUMENTS:\n");
	printf("  -E REMOTE_ID: specify remote id\n");
	printf("  -R READ_CH  : specify read channel\n");
	printf("  -W WRITE_CH : specify write channel\n");
	printf("OPTIONS:\n");
	printf("  -s MESSAGE  : send MESSAGE\n");
	printf("  -r          : receive messages\n");
	printf("  -t TIMEOUT  : exit in TIMEOUT seconds when receive\n");
	printf("e.g. (communicate with remote 0, use read channel 3 and write channel 3):\n");
	printf("  hal_msgbox -E 0 -R 3 -W 3 -s \"hello\" : send string \"hello\"\n");
	printf("  hal_msgbox -E 0 -R 3 -W 3 -r           : receive messages (default in 10 seconds)\n");
	printf("  hal_msgbox -E 0 -R 3 -W 3 -r -t 20     : receive messages in 20 seconds\n");
	printf("\n");
}

static int recv_callback(unsigned long data, void *private_data)
{
	BaseType_t taskwoken = pdFALSE;
	printf("Receive callback (data: 0x%lx)\n", data);
	struct msgbox_demo *demo = private_data;
	BaseType_t ret = xQueueSendFromISR(demo->recv_queue, &data, &taskwoken);
	if (ret == errQUEUE_FULL) {
		printf("recv_queue is full\n");
		return -1;
	}
	if (ret == pdPASS) {
		portYIELD_FROM_ISR(taskwoken);
	}
	return 0;
}

static int cmd_hal_msgbox(int argc, char *argv[])
{
	int ret = 0;
	int c;

	struct msgbox_demo demo= {
		.remote_id = -1,
		.read_ch = -1,
		.write_ch = -1,
		.recv_queue = NULL,
	};
	struct msg_endpoint ept;

	TickType_t start_ticks, current_ticks;
	int do_send = 0;
	const char *data_send= NULL;
	int do_recv = 0;
	int timeout_sec = 10;
	uint32_t data_recv;

	if (argc <= 1) {
		print_help_msg();
		ret = -1;
		goto out;
	}

	while ((c = getopt(argc, argv, "hs:rt:E:W:R:")) != -1) {
		switch (c) {
		case 'h' :
			print_help_msg();
			ret = 0;
			goto out;
		case 'E':
			demo.remote_id = atoi(optarg);
			break;
		case 'R':
			demo.read_ch = atoi(optarg);
			break;
		case 'W':
			demo.write_ch = atoi(optarg);
			break;
		case 's':
			do_send = 1;
			data_send = optarg;
			break;
		case 'r':
			do_recv = 1;
			break;
		case 't':
			timeout_sec = atoi(optarg);
			break;
		default:
			print_help_msg();
			ret = -1;
			goto out;
		}
	}

	if (demo.remote_id < 0 || demo.read_ch < 0 || demo.write_ch < 0) {
		printf("Error. Please specify remote id, read channel and write channel\n");
		print_help_msg();
		ret = -1;
		goto out;
	}

	printf("remote id: %d, write channel: %d, read channel: %d\n",
			demo.remote_id, demo.write_ch, demo.read_ch);

	if (do_recv) {
		demo.recv_queue = xQueueCreate(RECEIVE_QUEUE_LENGTH, sizeof(uint32_t));
		if (!demo.recv_queue) {
			printf("Failed to create receive queue\n");
			ret = -1;
			goto out;
		}
		ept.rec = (void *)recv_callback;
		ept.private = &demo;
	}

	ret = hal_msgbox_alloc_channel(&ept, demo.remote_id, demo.read_ch, demo.write_ch);
	if (ret != 0) {
		printf("Failed to allocate msgbox channel\n");
		goto delete_recv_queue;
	}

	if (do_send) {
		ret = hal_msgbox_channel_send(&ept, (unsigned char *)data_send, strlen(data_send));
		if (ret != 0) {
			printf("Failed to send message\n");
			goto free_channel;
		}
	}

	if (do_recv) {
		printf("hal_msgbox will exit in %d seconds\n", timeout_sec);
		start_ticks = xTaskGetTickCount();
		printf("start_ticks: %u\n", start_ticks);

		while (1) {
			if (pdTRUE == xQueueReceive(demo.recv_queue, &data_recv,
						RECEIVE_QUEUE_WAIT_MS / portTICK_PERIOD_MS)) {
				printf("Received from queue: 0x%x\n", data_recv);
			}
			current_ticks = xTaskGetTickCount();
			if ((current_ticks - start_ticks) * portTICK_PERIOD_MS
					>= timeout_sec * 1000) {
				printf("current_ticks: %u\n", current_ticks);
				break;
			}
		}
	}

	printf("hal_msgbox exited\n");
	ret = 0;

free_channel:
	hal_msgbox_free_channel(&ept);
delete_recv_queue:
	if (do_recv) {
		vQueueDelete(demo.recv_queue);
	}
out:
	return ret;
}

FINSH_FUNCTION_EXPORT_CMD(cmd_hal_msgbox, hal_msgbox, hal msgbox);
```

