# Mbus

MSI（Memory System Interconnet）是SoC系统中统筹所有模块访问dram的总线互联器。MSI支持AXI、MBUS、MBUS和MSB接口，各种接口的数量单独可配，为各个模块提供高效的存储交互。MSI具有以下特点

- 优先级控制
- 带宽监控
- 数据加扰
- 安全控制功能

其中的Mbus模块提供给用户使用的包括总线使能和获取带宽接口。

## 模块配置

配置路径如下:

```
Kernel Setup --->
    Drivers Setup --->
        SoC HAL Drivers --->
            MBUS Devices --->
                [*] enable mbus driver
```

## 源码结构

```c
rtos-hal/
|-- hal/source/mbus/hal_mbus.c   // hal层接口代码
|-- include/hal/sunxi_hal_mbus.h // 头文件
```

## 模块接口介绍

### Mbus 获取带宽枚举

```c
/* MBUS PMU ids */
enum mbus_pmu {
	MBUS_PMU_CPU    = 0,    /* CPU bandwidth */
	MBUS_PMU_GPU,           /* GPU bandwidth */
	MBUS_PMU_VE,            /* VE */
	MBUS_PMU_DISP,          /* DISPLAY */
	MBUS_PMU_OTH,           /* other masters */
	MBUS_PMU_TOTAL,         /* total masters */
	MBUS_PMU_RV_SYS,        /* RV_SYS */
	MBUS_PMU_CE,            /* CE */
	MBUS_PMU_DE,            /* DE */
	MBUS_PMU_G2D,           /* G2D */
	MBUS_PMU_TVD,           /* TVD */
	MBUS_PMU_CSI,           /* CSI */
	MBUS_PMU_DSP_SYS,       /* DSP_SYS */
	MBUS_PMU_DI,            /* DI */
	MBUS_PMU_IOMMU,         /* IOMMU */
	MBUS_PMU_DMA0,          /* DMA0 */
	MBUS_PMU_DMA1,          /* DMA1 */
	MBUS_PMU_MAHB,          /* MAHB */
};
```

### 返回值枚举

```c
typedef enum{
	HAL_MBUS_STATUS_ERROR_PARAMETER = -3,
	HAL_MBUS_STATUS_ERROR_CHANNEL = -2,
	HAL_MBUS_STATUS_ERROR = -1,
	HAL_MBUS_STATUS_OK = 0
}hal_mbus_status_t;
```

### Mbus 总线使能接口

使能Mbus总线

函数原型：

```c
hal_mbus_status_t hal_mbus_pmu_enable(void);
```

参数：

- 无

返回值：

- 参考hal_mbus_status_t枚举

### 获取带宽接口

获取不同模块在总线上的带宽

函数原型：

```c
hal_mbus_status_t hal_mbus_pmu_get_value(enum mbus_pmu type, unsigned int *value);
```

参数：

- type：模块类型
- value，保存获取的带宽数据

返回值：

- 参考hal_mbus_status_t枚举

## 模块使用范例

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>

#include <hal_cmd.h>
#include <sunxi_hal_mbus.h>

int cmd_mbus(int argc, char **argv)
{
	int cnt = 1;
	int ms_delay = 0;
	int windows_us;
	uint32_t cpu_value = 0, gpu_value = 0, ve_value = 0, disp_value = 0;
	uint32_t total_value = 0, di_value = 0, oth_value = 0, csi_value = 0;
	uint32_t tvd_value = 0, g2d_value = 0, iommu_value = 0, rv_value = 0;
	uint32_t dsp_value = 0, dma0_value = 0, dma1_value = 0, de_value = 0;
	uint32_t ce_value = 0, mahb_value = 0,rv_sys_value = 0;

	printf("============MBUS TEST===============\n");
	hal_mbus_pmu_enable();

	if (argc >= 2)
		cnt = atoi(argv[1]);

	if (argc >= 3)
		ms_delay = atoi(argv[2]);

	printf("the bus bandwidth occupancy status is :\n");
	while (cnt--) {
		hal_mbus_pmu_get_value(MBUS_PMU_CPU, &cpu_value);
		hal_mbus_pmu_get_value(MBUS_PMU_GPU, &gpu_value);
		hal_mbus_pmu_get_value(MBUS_PMU_RV_SYS, &rv_sys_value);
		hal_mbus_pmu_get_value(MBUS_PMU_VE, &ve_value);
		hal_mbus_pmu_get_value(MBUS_PMU_DISP, &disp_value);
		hal_mbus_pmu_get_value(MBUS_PMU_OTH, &oth_value);
		hal_mbus_pmu_get_value(MBUS_PMU_CE, &ce_value);
		hal_mbus_pmu_get_value(MBUS_PMU_DI, &di_value);
		hal_mbus_pmu_get_value(MBUS_PMU_DE, &de_value);
		hal_mbus_pmu_get_value(MBUS_PMU_CSI, &csi_value);
		hal_mbus_pmu_get_value(MBUS_PMU_TVD, &tvd_value);
		hal_mbus_pmu_get_value(MBUS_PMU_G2D, &g2d_value);
		hal_mbus_pmu_get_value(MBUS_PMU_IOMMU, &iommu_value);
		hal_mbus_pmu_get_value(MBUS_PMU_RV_SYS, &rv_value);
		hal_mbus_pmu_get_value(MBUS_PMU_DSP_SYS, &dsp_value);
		hal_mbus_pmu_get_value(MBUS_PMU_DMA0, &dma0_value);
		hal_mbus_pmu_get_value(MBUS_PMU_DMA1, &dma1_value);
		hal_mbus_pmu_get_value(MBUS_PMU_MAHB, &mahb_value);
		hal_mbus_pmu_get_value(MBUS_PMU_TOTAL, &total_value); //mbus calculate bw every window time, total is the max one
		hal_mbus_pmu_get_window(&windows_us);
		printf("window(us) maxbw(k) cpu      gpu      ve       disp     di       csi      tvd      g2d      iommu    rv       dsp      dma0     dma1     cd       de       mahb		others	rv_sys\n");
		printf("%-10d %-8d %-8d %-8d %-8d %-8d %-8d %-8d %-8d %-8d %-8d %-8d %-8d %-8d %-8d %-8d %-8d %-8d %-8d %-8d\n",\
				windows_us , total_value, cpu_value, gpu_value, ve_value, disp_value,\
				di_value, csi_value, tvd_value, g2d_value, iommu_value,\
				rv_value, dsp_value, dma0_value, dma1_value, ce_value,\
				de_value, mahb_value, oth_value,rv_sys_value);

		if (cnt && ms_delay)
			mdelay(ms_delay);
	}

	return 0;
}

FINSH_FUNCTION_EXPORT_CMD(cmd_mbus, mbus_test, Mbus hal APIs tests);

int cmd_mbus_enable(int argc, char **argv)
{
	hal_mbus_pmu_enable();

	return 0;
}

FINSH_FUNCTION_EXPORT_CMD(cmd_mbus_enable, mbus_enable, Mbus hal enable APIs tests);

int cmd_mbus_value(int argc, char **argv)
{

	int cnt = 1;
	int ms_delay = 0;
	int windows_us;
	uint32_t cpu_value = 0, gpu_value = 0, ve_value = 0, disp_value = 0;
	uint32_t total_value = 0, di_value = 0, oth_value = 0, csi_value = 0;
	uint32_t tvd_value = 0, g2d_value = 0, iommu_value = 0, rv_value = 0;
	uint32_t dsp_value = 0, dma0_value = 0, dma1_value = 0, de_value = 0;
	uint32_t ce_value = 0, mahb_value = 0,rv_sys_value = 0;

	if (argc >= 2)
		cnt = atoi(argv[1]);

	if (argc >= 3)
		ms_delay = atoi(argv[2]);

	printf("the bus bandwidth occupancy status is :\n");
	while (cnt--) {
		hal_mbus_pmu_get_value(MBUS_PMU_CPU, &cpu_value);
		hal_mbus_pmu_get_value(MBUS_PMU_GPU, &gpu_value);
		hal_mbus_pmu_get_value(MBUS_PMU_VE, &ve_value);
		hal_mbus_pmu_get_value(MBUS_PMU_DISP, &disp_value);
		hal_mbus_pmu_get_value(MBUS_PMU_OTH, &oth_value);
		hal_mbus_pmu_get_value(MBUS_PMU_CE, &ce_value);
		hal_mbus_pmu_get_value(MBUS_PMU_DI, &di_value);
		hal_mbus_pmu_get_value(MBUS_PMU_DE, &de_value);
		hal_mbus_pmu_get_value(MBUS_PMU_CSI, &csi_value);
		hal_mbus_pmu_get_value(MBUS_PMU_TVD, &tvd_value);
		hal_mbus_pmu_get_value(MBUS_PMU_G2D, &g2d_value);
		hal_mbus_pmu_get_value(MBUS_PMU_IOMMU, &iommu_value);
		hal_mbus_pmu_get_value(MBUS_PMU_RV_SYS, &rv_value);
		hal_mbus_pmu_get_value(MBUS_PMU_DSP_SYS, &dsp_value);
		hal_mbus_pmu_get_value(MBUS_PMU_DMA0, &dma0_value);
		hal_mbus_pmu_get_value(MBUS_PMU_DMA1, &dma1_value);
		hal_mbus_pmu_get_value(MBUS_PMU_MAHB, &mahb_value);
		hal_mbus_pmu_get_value(MBUS_PMU_TOTAL, &total_value); //mbus calculate bw every window time, total is the max one
		hal_mbus_pmu_get_window(&windows_us);
		printf("window(us) maxbw(k) cpu      gpu      ve       disp     di       csi      tvd      g2d      iommu    rv       dsp      dma0     dma1     cd       de       mahb		others \n");
		printf("%-10d %-8d %-8d %-8d %-8d %-8d %-8d %-8d %-8d %-8d %-8d   0x%08x  %-8d %-8d %-8d %-8d %-8d %-8d %-8d \n",\
				windows_us , total_value, cpu_value, gpu_value, ve_value, disp_value,\
				di_value, csi_value, tvd_value, g2d_value, iommu_value,\
				rv_value, dsp_value, dma0_value, dma1_value, ce_value,\
				de_value, mahb_value, oth_value);

		if (cnt && ms_delay)
			mdelay(ms_delay);
	}

	return 0;
}

FINSH_FUNCTION_EXPORT_CMD(cmd_mbus_value, mbus_test_value, Mbus hal value APIs tests);
```

