# CCU

介绍 RTOS 中CCU 驱动的接口及使用方法，为 CCU 的使用者提供参考。

## 模块介绍

CCU 驱动主要实现设备驱动的底层细节，并为上层提供一套标准的API 接口以供使用。

## 模块配置

其menuconfig 的配置如下：

```shell
Kernel Setup --->
    Drivers Setup --->
        SoC HAL Drivers --->
            CCMU devices --->
                [*] enable ccmu-ng driver
                [*] enbale ccmu-ng hal APIs Test command
```

## 源码结构

```c
.
│  common_ccmu.h
│  hal_clk.c
│  hal_reset.c
│  Kconfig
│  Makefile
│  platform_ccmu.h
│  platform_rst.h
│
├─sunxi
│  │  clk.c
│  │  clk.h
│  │  clk_factors.c
│  │  clk_factors.h
│  │  clk_periph.c
│  │  clk_periph.h
│  │  Makefile
│  │  platform_clk.h
│  │
│  └─sun8iw21p1             # sun8iw21p1平台实现(老平台，目前使用ng驱动)
│          clk_sun8iw21.c
│          clk_sun8iw21.h
│          Makefile
│
└─sunxi-ng                  # sunxi-ng 驱动实现
        ccu-sun20iw2-aon.c
        ccu-sun20iw2-aon.h
        ccu-sun20iw2-r.c
        ccu-sun20iw2-r.h
        ccu-sun20iw2.c
        ccu-sun20iw2.h
        ccu.c
        ccu.h
        ccu_common.c
        ccu_common.h
        ccu_div.c
        ccu_div.h
        ccu_frac.c
        ccu_frac.h
        ccu_gate.c
        ccu_gate.h
        ccu_mp.c
        ccu_mp.h
        ccu_mult.c
        ccu_mult.h
        ccu_mux.c
        ccu_mux.h
        ccu_nk.c
        ccu_nk.h
        ccu_nkm.c
        ccu_nkm.h
        ccu_nkmp.c
        ccu_nkmp.h
        ccu_nm.c
        ccu_nm.h
        ccu_phase.c
        ccu_phase.h
        ccu_reset.c
        ccu_reset.h
        ccu_sdm.c
        ccu_sdm.h
        clk-divider.c
        clk-fixed-factor.c
        clk-fixed-rate.c
        clk-fixed-rate.h
        clk.c
        clk.h
        Makefile
        rst-sun20iw2-aon.h
        rst-sun20iw2-r.h
        rst-sun20iw2.h
        type.h

```

## 模块接口说明

头文件

```c
#include <hal_clk.h>
#include <hal_reset.h>
#include <ccmu/common_ccmu.h>
```

### 返回值定义枚举

```c
typedef enum
{

    HAL_CLK_STATUS_DISABLED = -1,
    HAL_CLK_STATUS_ENABLED = 0,
    HAL_CLK_STATUS_ERROR_CLK_FACTOR_REFUSED = -11,
    HAL_CLK_STATUS_ERROR_CLK_NEED_DISABLED  = -10,
    HAL_CLK_STATUS_ERROR_CLK_PARENT_DISABLED  = -9,
    HAL_CLK_STATUS_ERROR_CLK_ENABLED_FAILED  = -8,
    HAL_CLK_STATUS_ERROR_CLK_ROUND_FAILED = -7,
    HAL_CLK_STATUS_ERROR_CLK_SET_RATE_REFUSED = -6,
    HAL_CLK_STATUS_ERROR_CLK_NOT_FOUND  = -5,
    HAL_CLK_STATUS_ERROT_CLK_UNDEFINED  = -4,
    HAL_CLK_STATUS_UNINITIALIZED = -3,        /**< Uninitialized clock driver. */
    HAL_CLK_STATUS_INVALID_PARAMETER = -2,    /**< Invalid parameter. */
    HAL_CLK_STATUS_ERROR = -1,                /**< Unknown error. */
    HAL_CLK_STATUS_OK = 0,                    /**< Successful. */
} hal_clk_status_t;
```

### 时钟类型定义枚举

```c
typedef enum
{
    HAL_SUNXI_FIXED_CCU = 0,
    HAL_SUNXI_RTC_CCU,
    HAL_SUNXI_CCU,
    HAL_SUNXI_AON_CCU,
    HAL_SUNXI_R_CCU,
    HAL_SUNXI_DSP,
    HAL_SUNXI_CCU_NUMBER,
} hal_clk_type_t;
```

### 初始化CCU驱动

函数原型

```c
void hal_clock_init(void);
```

参数：

- 无

返回值：

- 无



### 判断指定时钟是否已经打开

函数原型

```c
hal_clk_status_t hal_clock_is_enabled(hal_clk_t clk);
```

参数：

- clk：clk id

返回值：

- HAL_CLK_STATUS_ENABLED：打开
- HAL_CLK_STATUS_DISABLED：关闭



### 获得指定的时钟句柄

函数原型

```c
hal_clk_t hal_clock_get(hal_clk_type_t type, hal_clk_id_t id);
```

参数：

- type：时钟类型
- id：时钟id

返回值：

- 时钟句柄 hal_clk_t



### 释放指定时钟句柄

函数原型

```c
hal_clk_status_t hal_clock_put(hal_clk_t clk);
```

参数：

- clk：要操作的时钟句柄

返回值：

- 0：成功
- 负数：失败



### 打开指定时钟

函数原型

```c
hal_clk_status_t hal_clock_enable(hal_clk_t clk);
```

参数：

- clk：时钟id

返回值：

- 0：成功
- 负数：失败



### 关闭指定时钟

函数原型

```c
hal_clk_status_t hal_clock_disable(hal_clk_t clk);
```

参数：

- clk：时钟id

返回值：

- 0：成功
- 负数：失败



### 重新计算指定时钟的频率

函数原型

```c
u32 hal_clk_recalc_rate(hal_clk_t clk);
```

参数：

- clk：时钟id

返回值：

- 0：成功
- 负数：失败



### 设置一个跟指定频率最接近的时钟频

函数原型

```c
u32 hal_clk_round_rate(hal_clk_t clk, u32 rate);
```

参数：

- clk：时钟id
- rate：频率

返回值：

- 0：成功
- 负数：失败



### 获取指定时钟频率

!> 可能非实时

函数原型

```c
u32 hal_clk_get_rate(hal_clk_t clk);
```

参数：

- clk：时钟id

返回值：

- 0：成功
- 负数：失败



### 设置指定时钟的频

函数原型

```c
hal_clk_status_t hal_clk_set_rate(hal_clk_t clk,  u32 rate);
```

参数：

- clk：时钟id
- rate：频率

返回值：

- 0：成功
- 负数：失败



### 设置指定时钟的父时钟

函数原型

```c
hal_clk_status_t hal_clk_set_parent(hal_clk_t clk, hal_clk_t parent);
```

参数：

- clk：时钟id
- parent：父时钟id

返回值：

- 0：成功
- 负数：失败



### 获取指定时钟的父时钟

函数原型

```c
hal_clk_t hal_clk_get_parent(hal_clk_t clk);
```

参数：

- clk：时钟id

返回值：

- 0：成功
- 负数：失败

## 模块使用范例

```c
#include <stdlib.h>
#include <hal_log.h>
#include <hal_cmd.h>
#include <hal_clk.h>
#include <hal_reset.h>
#include <ccmu/common_ccmu.h>
#include "../../source/ccmu/sunxi-ng/ccu-sun20iw2-aon.h"

#ifndef CLK_RTC_NUMBER
#define CLK_RTC_NUMBER 0
#endif

int clk_number[] = {
	CLK_SRC_NUMBER,
	CLK_RTC_NUMBER,
	CLK_NUMBER,
	CLK_AON_NUMBER,
	CLK_R_NUMBER,
	0
};

int reset_number[] = {
	RST_BUS_NUMBER,
	RST_R_BUS_NUMBER,
	0,
};

char *strict_clks[] = {
	"pll-ddr0",
	"riscv",
	"pll-cpux",
	"pll-periph0-parent",
	"riscv-axi",
	"apb1",
	"fanout-27m",
	"fix-losc",
	"rc-16m",
	"ext-32k",
	"rc-hf",
	"pclk-spc-1",
	"pclk-spc-2",
	"pclk-spc",
	NULL,
};

char *clk_type_name[] = {
	"HAL_SUNXI_FIXED_CCU",
	"HAL_SUNXI_RTC_CCU",
	"HAL_SUNXI_CCU",
	"HAL_SUNXI_AON_CCU",
	"HAL_SUNXI_R_CCU",
};

int is_strict_clk(hal_clk_t clk)
{
	int i;
	for (i = 0; strict_clks[i] != NULL; i++)
	{
		if (!strcmp(clk->name, strict_clks[i]))
			return 1;
	}

	return 0;
}

int is_dcxo_clk(hal_clk_t clk)
{
	if (!strncmp(clk->name, "dcxo", 4))
		return 1;
	return 0;
}

int cmd_test_ng_ccmu(int argc, char **argv)
{
	int i, j;

	hal_clk_type_t clk_type;
	hal_clk_id_t   clk_id;
	hal_clk_t clk, p_clk;
	u32  old_rate;

	hal_reset_type_t reset_type;
	hal_reset_id_t  reset_id;
	hal_clk_status_t clk_status;
	struct reset_control *reset;
	int reset_status;
	u32 new_rate;
    
	printf("clock\t\t\t\t\t type\t\t\t\t\t parent\t\t\t\t\t rate\n");
	for (i = HAL_SUNXI_FIXED_CCU; i < HAL_SUNXI_CCU_NUMBER; i++)
	{
		clk_type = i;
		for (j = 0; j < clk_number[i]; j++)
		{
			clk_id = j;
			clk = hal_clock_get(clk_type, clk_id);
			if (!clk) {
				printf("fail to get clk\n");
				continue;
			}

			p_clk = hal_clk_get_parent(clk);

			old_rate = hal_clk_get_rate(clk);
			if (p_clk)
				printf("%-20s\t\t\t %-20s\t\t\t %-15s\t\t\t %d\n", clk->name, clk_type_name[i], p_clk->name, old_rate);
			else
				printf("%-20s\t\t\t %-20s\t\t\t NULL\t\t\t\t\t %d\n", clk->name, clk_type_name[i], old_rate);

		}
	}
	for (i = HAL_SUNXI_RESET; i < HAL_SUNXI_RESET_NUMBER; i++)
	{
		reset_type = i;
		for (j = 0; j < reset_number[i]; j++)
		{
			reset_id = j;

			printf("reset: get reset control, type:%d, id: %d\n", reset_type, reset_id);
			reset = hal_reset_control_get(reset_type, reset_id);

			printf("reset: control deassert\n");
			hal_reset_control_deassert(reset);

			reset_status = hal_reset_control_status(reset);
			printf("reset status: %s", reset_status ? "assert" : "deassert");

			printf("reset: put reset control, type:%d, id: %d\n", reset_type, reset_id);
			hal_reset_control_put(reset);
		}
	}
	return 0;
}

FINSH_FUNCTION_EXPORT_CMD(cmd_test_ng_ccmu, hal_ccmu, sunxi - ng ccmu hal APIs tests)
```

