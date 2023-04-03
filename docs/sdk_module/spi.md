# SPI

## 模块介绍

SPI 是一种全双工同步串行接口，可以工作在 Master 模式和 Slave 模式，SPI 主要有以下特点：

- 全双工同步串行接口
- Master/Slave 模式可配置
- 支持最大 96MHz 时钟频率
- 支持 SPI Mode0/1/2/3
- 片选和时钟的极性和相位可配置
- 5 个时钟源
- 支持中断或 DMA 传输
- 支持多片选
- 支持 Standard Single/Dual/Quad SPI，FIFO 深度 64B
- 其中 SPI1 支持 DBI 接口，同时兼容多种视频数据格式

## 模块配置

```
Kernel Setup --->
    Drivers Setup --->
        SoC HAL Drivers --->
            spi devices --->
                [*] enable spi driver
```

## 源码结构

```c
rtos-hal/
|--include/hal/sunxi_hal_spi.h       // hal层数据结构和API接口相关头文件
|--hal/source/spi/platform_spi.h     // hal层平台相关头文件
|--hal/source/spi/platform/spi_xxx.h // hal层平台信息相关头文件
|--hal/source/spi/common_spi.h       // hal层控制器寄存器相关头文件
|--hal/source/spi/hal_spi.c          // hal层接口驱动代码
```

## 模块接口说明

```c
#include <sunxi_hal_spi.h>
```

### SPI Master 端口枚举

```c
typedef enum
{
    HAL_SPI_MASTER_0 = 0, /**< spi master port 0 */
    HAL_SPI_MASTER_1 = 1, /**< spi master port 1 */
    HAL_SPI_MASTER_2 = 2, /**< spi master port 2 */
    HAL_SPI_MASTER_3 = 3, /**< spi master port 3 */
    HAL_SPI_MASTER_MAX = SPI_MAX_NUM,   /**< spi master max port number\<invalid\> */
} hal_spi_master_port_t;
```

### SPI Master 配置信息

```c
typedef struct {
  uint8_t *tx_buf;        /*< Data buffer to send, */
  uint32_t tx_len;        /*< The total number of bytes to send. */
  uint32_t tx_single_len; /*< The number of bytes to send in single mode. */
  uint8_t *rx_buf;        /*< Received data buffer, */
  uint32_t rx_len;        /*< The valid number of bytes received. */
  uint8_t tx_nbits : 3;   /*< Data buffer to send in nbits mode */
  uint8_t rx_nbits : 3;   /*< Data buffer to received in nbits mode */
  uint8_t dummy_byte;     /*< Flash send dummy byte, default 0*/
#define SPI_NBITS_SINGLE 0x01 /* 1bit transfer */
#define SPI_NBITS_DUAL 0x02   /* 2bit transfer */
#define SPI_NBITS_QUAD 0x04   /* 4bit transfer */
  uint8_t bits_per_word;      /*< transfer bit_per_word */
} hal_spi_master_transfer_t;
```

### SPI 模式类型枚举

```c
typedef enum spi_mode_type {
  SGLE_HALF_DUPLEX_RX,      /* single mode, half duplex read */
  SGLE_HALF_DUPLEX_TX,      /* single mode, half duplex write */
  SINGLE_FULL_DUPLEX_RX_TX, /* single mode, full duplex read and write */
  DUAL_HALF_DUPLEX_RX,      /* dual mode, half duplex read */
  DUAL_HALF_DUPLEX_TX,      /* dual mode, half duplex write */
  QUAD_HALF_DUPLEX_RX,      /* quad mode, half duplex read */
  QUAD_HALF_DUPLEX_TX,      /* quad mode, half duplex write */
  FULL_DUPLEX_TX_RX,        /* full duplex read and write */
  MODE_TYPE_NULL,
} spi_mode_type_t;
```





### SPI 模块初始化

SPI 模块初始化，主要申请中断、pinctrl 初始化、clk 初始化等

```c
spi_master_status_t hal_spi_init(hal_spi_master_port_t port)
```

参数：

- port:SPI 端口号

返回值：

- 0：正常
- 负数：失败

### SPI 模块去初始化

SPI 模块去初始化

```c
spi_master_status_t hal_spi_deinit(hal_spi_master_port_t port)
```

参数：

- port:SPI 端口号

返回值：

- 0：正常
- 负数：失败

### 配置 SPI 模块

配置 SPI 模块，包括 SPI 总线最大传输速率、片选模式等

```c
spi_master_status_t hal_spi_hw_config(hal_spi_master_port_t port, hal_spi_master_config_t *spi_config)
```

参数：

- port:SPI 端口号
- spi_config: 配置信息

返回值：

- 0：正常
- 负数：失败

### 发送数据

发送数据，调 hal_spi_xfer 接口

```c
spi_master_status_t hal_spi_write(hal_spi_master_port_t port, const void *buf, uint32_t size)
```

参数：

- port:SPI 端口号
- buf: 发送数据
- size: 发送数据大小

返回值：

- 0：正常
- 负数：失败

### 接收数据

接收数据，调 hal_spi_xfer 接口

```c
spi_master_status_t hal_spi_read(hal_spi_master_port_t port, void *buf, uint32_t size)
```

参数：

- port:SPI 端口号
- buf: 接收数据
- size: 接收数据大小

返回值：

- 0：正常
- 负数：失败

### 发送或接收数据

发送或接收数据

```c
spi_master_status_t hal_spi_xfer(hal_spi_master_port_t port, hal_spi_master_transfer_t *transfer)
```

参数：

- port:SPI 端口号
- transfer: 传输配置信息

返回值：

- 0：正常
- 负数：失败

## 模块使用范例

```c
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/time.h>
#include <unistd.h>

#include <hal_cmd.h>
#include <hal_log.h>
#include <hal_mem.h>
#include <hal_timer.h>
#include <sunxi_hal_spi.h>

#define TEST_READ 0
#define TEST_WRITE 1

static int cmd_test_spi(int argc, const char** argv)
{
    hal_spi_master_port_t port;
    hal_spi_master_config_t cfg;
    char tbuf[10] = { 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x20 };
    char rbuf[10];
    char rw = 1;
    int c;

    if (argc < 3) {
        printf("Usage:\n");
        printf("\thal_spi <port> <-r|-w>\n");
        return -1;
    }

    printf("Run spi test\n");

    port = strtol(argv[1], NULL, 0);
    while ((c = getopt(argc, (char* const*)argv, "r:w")) != -1) {
        switch (c) {
        case 'r':
            rw = TEST_READ;
            break;
        case 'w':
            rw = TEST_WRITE;
            break;
        }
    }

    cfg.clock_frequency = 5000000;
    cfg.slave_port = HAL_SPI_MASTER_SLAVE_0;
    cfg.cpha = HAL_SPI_MASTER_CLOCK_PHASE0;
    cfg.cpol = HAL_SPI_MASTER_CLOCK_POLARITY0;
    cfg.sip = 0;
    cfg.flash = 0;
    hal_spi_init(port, &cfg);
    if (rw == TEST_READ) {
        hal_spi_read(port, rbuf, 10);
        printf("rbuf: %s\n", rbuf);
    } else if (rw == TEST_WRITE) {
        hal_spi_write(port, tbuf, 10);
    }

    printf("Spi test finish\n");

    hal_spi_deinit(port);

    return 0;
}

FINSH_FUNCTION_EXPORT_CMD(cmd_test_spi, hal_spi, spi hal APIs tests)

static int cmd_test_spi_quad(int argc, const char** argv)
{
    hal_spi_master_port_t port;
    hal_spi_master_config_t cfg;
    char tbuf[10] = { 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x20 };
    char rbuf[10];

    if (argc < 2) {
        printf("Usage:\n");
        printf("\thal_spi_quad <port> \n");
        return -1;
    }

    printf("Run spi quad test\n");

    port = strtol(argv[1], NULL, 0);

    cfg.clock_frequency = 5000000;
    cfg.slave_port = HAL_SPI_MASTER_SLAVE_0;
    cfg.cpha = HAL_SPI_MASTER_CLOCK_PHASE0;
    cfg.cpol = HAL_SPI_MASTER_CLOCK_POLARITY0;
    cfg.sip = 0;
    cfg.flash = 0;
    hal_spi_init(port, &cfg);
    hal_spi_master_transfer_t tr;
    tr.tx_buf = (uint8_t*)tbuf;
    tr.tx_len = 10;
    tr.rx_buf = (uint8_t*)rbuf;
    tr.rx_len = 0;
    tr.tx_nbits = SPI_NBITS_QUAD;
    tr.tx_single_len = 10;
    tr.dummy_byte = 0;
    hal_spi_xfer(port, &tr);

    printf("Spi test finish\n");

    hal_spi_deinit(port);

    return 0;
}

FINSH_FUNCTION_EXPORT_CMD(cmd_test_spi_quad, hal_spi_quad, spi hal APIs tests)

static int cmd_test_spi_loop(int argc, const char** argv)
{
    hal_spi_master_port_t port;
    hal_spi_master_config_t cfg;
    hal_spi_master_transfer_t tr;
    char* tbuf = NULL;
    char* rbuf = NULL;
    int size = 0;
    int i, j, loop;
    struct timeval start, end;
    int sucess = 0, failed = 0;
    unsigned long time = 0;
    double tr_speed = 0.0f;

    if (argc < 2) {
        printf("Usage:\n");
        printf("\t%s init <port> <freq>\n", argv[0]);
        printf("\t%s deinit <port>\n", argv[0]);
        printf("\t%s loop_test <port> <size> <loop_times>\n", argv[0]);
        return -1;
    }

    printf("Run spi loop test\n");

    port = strtol(argv[2], NULL, 0);

    if (!strcmp(argv[1], "init")) {
        cfg.clock_frequency = strtol(argv[3], NULL, 0);
        cfg.slave_port = HAL_SPI_MASTER_SLAVE_0;
        cfg.cpha = HAL_SPI_MASTER_CLOCK_PHASE0;
        cfg.cpol = HAL_SPI_MASTER_CLOCK_POLARITY0;
        cfg.sip = 0;
        cfg.flash = 0;
        hal_spi_init(port, &cfg);
    } else if (!strcmp(argv[1], "deinit")) {
        hal_spi_deinit(port);
    } else if (!strcmp(argv[1], "loop_test")) {
        size = strtol(argv[3], NULL, 0);
        loop = strtol(argv[4], NULL, 0);
        tbuf = hal_malloc(size);
        rbuf = hal_malloc(size);
        if (!(tbuf && rbuf)) {
            printf("Request buffer size %d failed\n", size);
            return 0;
        }

        /* Init buffer data */
        for (i = 0; i < size; i++) {
            tbuf[i] = i & 0xFF;
        }

        tr.tx_buf = (uint8_t*)tbuf;
        tr.tx_len = size;
        tr.tx_nbits = SPI_NBITS_SINGLE;
        tr.tx_single_len = size;
        tr.rx_buf = (uint8_t*)rbuf;
        tr.rx_len = size;
        tr.rx_nbits = SPI_NBITS_SINGLE;

        for (i = 0; i < loop; i++) {
            printf("loop test round %d\n", i);

            if (tr.tx_len <= 32) {
                printf("tbuf: ");
                for (j = 0; j < tr.tx_len; j++) {
                    printf("%02X ", tr.tx_buf[j]);
                }
                printf("\n");
            }

            memset(tr.rx_buf, 0, tr.rx_len);
            gettimeofday(&start, NULL);
            hal_spi_xfer(port, &tr);
            gettimeofday(&end, NULL);

            if (tr.rx_len <= 32) {
                printf("rbuf: ");
                for (j = 0; j < tr.rx_len; j++) {
                    printf("%02X ", tr.rx_buf[j]);
                }
                printf("\n");
            }

            if (!memcmp(tr.tx_buf, tr.rx_buf, size)) {
                sucess++;
                time += (1000000 * (end.tv_sec - start.tv_sec) + end.tv_usec - start.tv_usec);
                printf("compare with tbuf rbuf %d : pass\n", size);
            } else {
                failed++;
                printf("compare with tbuf rbuf %d : failed\n", size);
            }

            hal_msleep(5);
        }

        hal_free((void*)tbuf);
        hal_free((void*)rbuf);

        printf("compare buffer total %d : sucess %d, failed %d\n", loop, sucess, failed);
        tr_speed = ((double)(size * sucess) / 1024.0f / 1024.0f) / ((double)time / 1000.0f / 1000.0f);
        printf("Transfer %d take %ld us (%lf MB/s)\n", size * sucess, time, tr_speed);
    }

    printf("Spi test finish\n");

    return 0;
}

FINSH_FUNCTION_EXPORT_CMD(cmd_test_spi_loop, hal_spi_loop, spi hal APIs tests)
```

测试命令：

- hal_spi_loop 测试 SPI Single 模式，可以配置端口，频率，数据量等参数
- hal_spi_loop init <port> <freq>
- hal_spi_loop deinit <port>
- hal_spi_loop loop_test <port> <size> <loop_times>

## 调试方法

SPI 驱动中预留了 3 个调试宏开关，可以根据需求相应开启

- SPI_INFO_LEVEL：开启后驱动会将一些调试信息打印到串口终端上
- SPI_DATA_LEVEL：开启后驱动会将 RX/TX buffer 中的数据打印到串口终端上方便观察
- SPI_DUMPREG_LEVEL：开启后驱动会在 RX/TX 时分别 dump 一次 SPI 的寄存器信息并打印到串口终端上方便观察

## 修改 SPI 时钟

申请 SPI 初始化时，配置 `hal_spi_master_config_t` 结构体里 `clock_frequency` 参数，如果没有配置 `clock_frequency`，那么默认使用宏 `SPI_MOD_CLK` 配置，具体定义在：`spi/common_spi.h`

