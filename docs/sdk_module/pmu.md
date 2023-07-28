# PMU

PMU - 电源管理单元，负责系统各模块供电及电池充放电管理。

## 模块配置

regulator 相关配置项：

```
Drivers Options --->
    soc related device drivers --->
        REGULATOR Devices --->
            [*] enable regulator driver
            [*] regulator test
```

power 相关配置项：

```
Drivers Options --->
    soc related device drivers --->
        POWER Devices --->
            [*] enable power driver
                [*] use axp2585
                [*] regulator test
```

## 源码结构介绍

```
lichee/rtos-hal/hal/source/power/
├── axp2585.c
├── axp2585.h
├── axp.c
├── axp_twi.c
├── ffs.h
├── Kconfig
├── Makefile
├── sun20iw2p1
│ └── core.c
└── type.h

lichee/rtos-hal/hal/source/regulator/
├── Kconfig
├── Makefile
└── sun20iw2p1
  └── core.c
```

## 模块接口说明

头文件：

```c
#include <sunxi_hal_power.h>
#include <sunxi_hal_regulator.h>
```

### regulator 相关结构体

```c
struct regulator_ops{
	int (*enable) (struct regulator_dev *);
	int (*disable) (struct regulator_dev *);
	int (*set_voltage) (struct regulator_dev *, int target_uV);
	int (*get_voltage) (struct regulator_dev *, int *vol_uV);
	int (*set_en) (struct regulator_dev *, unsigned int flags);
	int (*set_voltage_ext) (struct regulator_dev *, int target_uV, unsigned int status);
	int (*get_voltage_ext) (struct regulator_dev *, int *vol_uV,  unsigned int status);
};

struct regulator_dev{
	unsigned int flag;
	struct regulator_ops *ops;
	void *private;
};
```

### power 相关结构体

```c
struct power_dev{
	unsigned int flag;
	struct bat_power_ops *bat_ops;
	struct usb_power_ops *usb_ops;
	struct power_supply  *config;
	hal_sem_t irq_schd;
};
```

### regulator 获取电路接口

函数原型

```c
int hal_regulator_get(unsigned int request_flag, struct regulator_dev *rdev)
```

参数：

- rdev: 指定regulator的结构体
- request_flag: 指定regulator的电路参数

返回值：

- 成功：0
- 失败：‑1



### regulator 电路使能接口

函数原型

```c
int hal_regulator_set_able(struct regulator_dev *rdev, unsigned int flags)
```

参数：

- rdev: 指定regulator的结构体
- flags: 电路开关状态

返回值：

- 成功：0
- 失败：‑1



### regulator 获取电压接口

函数原型

```c
int hal_regulator_get_voltage_ext(struct regulator_dev *rdev, int *vol_uV, unsigned int status)
```

参数：

- rdev: 指定regulator的结构体
- vol_uV: 获取的电压信息
- status: 运行/休眠时的电压

返回值：

- 成功：0
- 失败：‑1



### regulator 调节电压接口

函数原型

```c
int hal_regulator_set_voltage_ext(struct regulator_dev *rdev, int target_uV, unsigned int status)
```

参数：

- rdev: 指定regulator的结构体
- target_uV: 指定调压信息
- status: 运行/休眠时的电压

返回值：

- 成功：0
- 失败：‑1



### power 初始化

函数原型

```c
int hal_power_init(void);
```

参数：

- 无

返回值：

- 成功：0
- 失败：‑1



### 获取当前 power 驱动

函数原型

```c
int hal_power_get(struct power_dev *rdev);
```

参数：

- rdev：初始化前的 power_dev 结构体

返回值：

- 0



### 获取电池电量信息

函数原型

```c
int hal_power_get_bat_cap(struct power_dev *rdev);
```

参数：

- rdev：初始化后power_dev 结构体

返回值：

- 电池电量，[0‑100]
- 失败：‑1



### 获取库仑计信息

函数原型

```c
int hal_power_get_coulumb_counter(struct power_dev *rdev);
```

参数：

- rdev：初始化后power_dev 结构体

返回值：

- 成功：返回电流大小，单位mA
- 失败：‑1



### 查看电池当前状态

函数原型

```c
int hal_power_get_bat_present(struct power_dev *rdev);
```

参数：

- rdev：初始化后power_dev 结构体

返回值：

- 成功：电池有效返回1，否则返回0
- 失败：‑1



### 查看电池是否连接

函数原型

```c
int hal_power_get_bat_online(struct power_dev *rdev);
```

参数：

- rdev：初始化后power_dev 结构体

返回值：

- 成功：电池存在返回1，否则返回0
- 失败：‑1



### 获取电池充电状态

函数原型

```c
int hal_power_get_bat_status(struct power_dev *rdev);
```

参数：

- rdev：初始化后power_dev 结构体

返回值：

- 成功：返回电池的多种状态，[0] 未知状态；[1] 充电状态；[3] 连接单不充电；[4] 充满电。
- 失败：‑1



### 获取电池当前的健康状态

函数原型

```c
int hal_power_get_bat_health(struct power_dev *rdev);
```

参数：

- rdev：初始化后power_dev 结构体

返回值：

- 成功：返回1，电池健康
- 失败：‑1



### 获取电池电压

函数原型

```c
int hal_power_get_vbat(struct power_dev *rdev);
```

参数：

- rdev：初始化后power_dev 结构体

返回值：

- 成功：返回当前电压，单位mV
- 失败：‑1



### 获取充电电流

函数原型

```c
int hal_power_get_ibat(struct power_dev *rdev);
```

参数：

- rdev：初始化后power_dev 结构体

返回值：

- 成功：返回当前充电电流，单位mA
- 失败：‑1



### 获取放电电流

函数原型

```c
int hal_power_get_disibat(struct power_dev *rdev);
```

参数：

- rdev：初始化后power_dev 结构体

返回值：

- 成功：返回当前放电电流，单位mA
- 失败：‑1



### 获取 AXP IC 温度

函数原型

```c
int hal_power_get_temp(struct power_dev *rdev);
```

参数：

- rdev：初始化后power_dev 结构体

返回值：

- 成功：当前AXP IC 温度，单位为温度数值*10
- 失败：‑1



### 获取电池温度

函数原型

```c
int hal_power_get_temp_ambient(struct power_dev *rdev)
```

参数：

- 成功：当前电池温度，单位为温度数值*10

返回值：

- 失败：‑1



### 设置充电电流

函数原型

```c
int hal_power_set_chg_cur(struct power_dev *rdev, int cur)
```

参数：

- rdev：初始化后power_dev 结构体
- cur：充电电流大小，单位mA

返回值：

- 成功：0
- 失败：‑1



### 设置充电截止电压

函数原型

```c
int hal_power_set_chg_vol(struct power_dev *rdev, int vol)
```

参数：

- rdev：初始化后power_dev 结构体
- vol：充电截止电压，单位mV

返回值：

- 成功：0
- 失败：‑1



### 设置电池开关

函数原型

```c
int hal_power_set_batfet(struct power_dev *rdev, int onoff)
```

参数：

- rdev：初始化后power_dev 结构体
- onoff：电池开关，0 关闭电池与电路连接，1 打开连接

返回值：

- 成功：0
- 失败：‑1



### 获取当前USB 状态

函数原型

```c
int hal_power_get_usb_status(struct power_dev *rdev)
```

参数：

- rdev：初始化后power_dev 结构体

返回值：

- 成功：[1]USB 连接，有VBUS；[0] 无USB 连接，无VBUS
- 失败：‑1



### 获取USB 口输入限流值

函数原型

```c
int hal_power_get_usb_ihold(struct power_dev *rdev)
```

参数：

- rdev：初始化后power_dev 结构体

返回值：

- 成功：USB 口限流的电流值，单位mA
- 失败：‑1



### 获取USB 口输入限压值

函数原型

```c
int hal_power_get_usb_vhold(struct power_dev *rdev)
```

参数：

- rdev：初始化后power_dev 结构体

返回值：

- 成功：USB 口限压电流值，单位mV
- 失败：‑1



### 设置USB 口输入限流值

函数原型

```c
int hal_power_set_usb_ihold(struct power_dev *rdev, int cur)
```

参数：

- rdev：初始化后power_dev 结构体
- cur：USB 口限流的电流值，单位mA，范围[0‑3100]

返回值：

- 成功：0
- 失败：‑1



### 设置USB 口输入限压值

函数原型

```c
int hal_power_set_usb_vhold(struct power_dev *rdev, int vol)
```

参数：

- rdev：初始化后power_dev 结构体
- vol：USB 口输入限压值，单位mV，范围[3880mV~5080mV]

返回值：

- 成功：0
- 失败：‑1



## 模块使用范例

### regulator 模块使用范例

```c
#include <stdio.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>
#include <stddef.h>

#include <unistd.h>

#include <sunxi_hal_regulator.h>
#include <sunxi_hal_common.h>
#include <hal_cmd.h>
#include <hal_log.h>

#define SOC_PRCM_BASE     		  (0x40050000)
#define SOC_PRCM_DCDC_CTRL0       (SOC_PRCM_BASE+0x0004)
#define SOC_PRCM_DCDC_CTRL1       (SOC_PRCM_BASE+0x0008)
#define SOC_PRCM_DCDC_LDO_MODE    (SOC_PRCM_BASE+0x000c)
#define SOC_PRCM_RTC_LDO_CTRL     (SOC_PRCM_BASE+0x0020)
#define SOC_PRCM_EXT_LDO_CTRL     (SOC_PRCM_BASE+0x0024)
#define SOC_PRCM_TOP_LDO_CTRL     (SOC_PRCM_BASE+0x0028)
#define SOC_PRCM_AON_LDO_CTRL     (SOC_PRCM_BASE+0x0040)
#define SOC_PRCM_APP_LDO_CTRL     (SOC_PRCM_BASE+0x0044)
#define SOC_PRCM_DSP_LDO_CTRL     (SOC_PRCM_BASE+0x004c)

//test : rpccli arm hal_regulator_set_current_able

static int hal_regulator_regs_check(void)
{
	printf("[regulator] %x:%x\n", SOC_PRCM_DCDC_CTRL0, readl(SOC_PRCM_DCDC_CTRL0));
	printf("[regulator] %x:%x\n", SOC_PRCM_DCDC_CTRL1, readl(SOC_PRCM_DCDC_CTRL1));
	printf("[regulator] %x:%x\n", SOC_PRCM_DCDC_LDO_MODE, readl(SOC_PRCM_DCDC_LDO_MODE));
	printf("[regulator] %x:%x\n", SOC_PRCM_RTC_LDO_CTRL, readl(SOC_PRCM_RTC_LDO_CTRL));
	printf("[regulator] %x:%x\n", SOC_PRCM_EXT_LDO_CTRL, readl(SOC_PRCM_EXT_LDO_CTRL));
	printf("[regulator] %x:%x\n", SOC_PRCM_TOP_LDO_CTRL, readl(SOC_PRCM_TOP_LDO_CTRL));
	printf("[regulator] %x:%x\n", SOC_PRCM_AON_LDO_CTRL, readl(SOC_PRCM_AON_LDO_CTRL));
	printf("[regulator] %x:%x\n", SOC_PRCM_APP_LDO_CTRL, readl(SOC_PRCM_APP_LDO_CTRL));
	printf("[regulator] %x:%x\n", SOC_PRCM_DSP_LDO_CTRL, readl(SOC_PRCM_DSP_LDO_CTRL));
	return 0;
}

static int cmd_set_able(int argc, const char **argv)
{
	int ret;
	int id = SOC_ID_MAX;
	unsigned int flag = 0;
	struct regulator_dev regulator;
	if (argv[1])
		id = (int)*argv[1] - 48;
	if (argv[2])
		flag = (int)*argv[2] - 48;
	printf("[regulator] set regulator_en[%d]:%x, flage:%d\n", id, REGULATOR_GET(SOC_REGULATOR, id), flag);
	hal_regulator_get(REGULATOR_GET(SOC_REGULATOR, id), &regulator);
	printf("[regulator] set_able regulator_en\n");
	hal_regulator_set_able(&regulator, flag);
	printf("[regulator] set_regulator[%d]able_status:%d\n", id, flag);
	hal_regulator_regs_check();
	return 0;
}
FINSH_FUNCTION_EXPORT_CMD(cmd_set_able, hal_regulator_set_current_able, regulator hal APIs tests)

static int cmd_get_voltage_ext(int argc, const char **argv)
{
	int ret;
	int id = SOC_ID_MAX;
	unsigned int flag = 0;
	struct regulator_dev regulator;
	if (argv[1])
		id = (int)*argv[1] - 48;
	if (argv[2])
		flag = (int)*argv[2] - 48;
	printf("[regulator] get regulator:%x\n", REGULATOR_GET(SOC_REGULATOR, id));
	hal_regulator_get(REGULATOR_GET(SOC_REGULATOR, id), &regulator);
	printf("[regulator] cat check_dedc_status\n");
	hal_regulator_get_voltage_ext(&regulator, &ret, flag);
	printf("[regulator] get_regulator[%d]status[%d]voltage:%d\n", id, flag, ret);
	hal_regulator_regs_check();
	return 0;
}
FINSH_FUNCTION_EXPORT_CMD(cmd_get_voltage_ext, hal_regulator_get_voltage, regulator hal APIs tests)

static int cmd_set_voltage_ext(int argc, const char **argv)
{
	int ret[4] = {0};
	int ret1;
	int id = SOC_ID_MAX;
	unsigned int flag = 0;
	struct regulator_dev regulator;
	if (argv[1])
		id = (int)*argv[1] - 48;
	if (argv[2])
		flag = (int)*argv[2] - 48;
	if (argv[3])
		ret[0] = ((int)*argv[3] - 48) * 1000;
	if (argv[4])
		ret[1] = ((int)*argv[4] - 48) * 100;
	if (argv[5])
		ret[2] = ((int)*argv[5] - 48) * 10;
	if (argv[6])
		ret[3] = ((int)*argv[6] - 48) * 1;
	ret1 = (ret[0] + ret[1] + ret[2] + ret[3]) * 1000;
	printf("[regulator] set regulator:%x\n", REGULATOR_GET(SOC_REGULATOR, id));
	hal_regulator_get(REGULATOR_GET(SOC_REGULATOR, id), &regulator);
	printf("[regulator] set_regulator[%d]status[%d]voltage:%d\n", id, flag, ret1);
	hal_regulator_set_voltage_ext(&regulator, ret1, flag);
	printf("[regulator] finishe-set_regulator[%d]status[%d]voltage:%d\n", id, flag, ret1);
	hal_regulator_regs_check();
	return 0;
}

FINSH_FUNCTION_EXPORT_CMD(cmd_set_voltage_ext, hal_regulator_set_voltage, regulator hal APIs tests)
```

### power 模块使用范例

```c
#include <stdio.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>

#include <sunxi_hal_power.h>
#include <hal_cmd.h>
#include <hal_log.h>

static int cmd_test_power_get_bat(int argc, const char **argv)
{
	int ret;
	struct power_dev rdev;
	printf("[power] get power\n");
	hal_power_get(&rdev);

	printf("[power] get bat cap\n");
	ret = hal_power_get_bat_cap(&rdev);
	printf("[power] bat cap:%d\n", ret);

	printf("[power] get_coulumb_counter\n");
	ret = hal_power_get_coulumb_counter(&rdev);
	printf("[power] coulumb_counter:%d\n", ret);

	printf("[power] get bat_present\n");
	pr_err("pmu_bat_unused:%d\n", rdev.config->pmu_bat_unused);
	pr_err("pmu_version:%d\n", rdev.config->pmu_version);
	ret = hal_power_get_bat_present(&rdev);
	printf("[power] bat_present:%d\n", ret);

	printf("[power] get online\n");
	ret = hal_power_get_bat_online(&rdev);
	printf("[power] bat online:%d\n", ret);

	printf("[power] get status\n");
	ret = hal_power_get_bat_status(&rdev);
	printf("[power] bat status:%d\n", ret);

	printf("[power] get bat health\n");
	ret = hal_power_get_bat_health(&rdev);
	printf("[power] bat health:%d\n", ret);

	printf("[power] get vbat\n");
	ret = hal_power_get_vbat(&rdev);
	printf("[power] bat vbat:%d\n", ret);

	printf("[power] get ibat\n");
	ret = hal_power_get_ibat(&rdev);
	printf("[power] bat ibat:%d\n", ret);

	printf("[power] get disibat\n");
	ret = hal_power_get_disibat(&rdev);
	printf("[power] bat disibat:%d\n", ret);

	printf("[power] get temp\n");
	ret = hal_power_get_temp(&rdev);
	printf("[power] bat temp:%d\n", ret);

	printf("[power] bat get test finish\n");
	return 0;
}
FINSH_FUNCTION_EXPORT_CMD(cmd_test_power_get_bat, test_power_get_bat, power hal APIs tests)

static int cmd_test_power_set_bat(int argc, const char **argv)
{
	int ret;
	struct power_dev rdev;
    int cur = strtol(argv[1], NULL, 0);
    int vol = strtol(argv[2], NULL, 0);

	printf("[power] set bat power:cur:%d vol:%d\n", cur, vol);
	hal_power_get(&rdev);

	printf("[power] set bat cur:%d\n", cur);
	ret = hal_power_set_chg_cur(&rdev, cur);
	printf("[power] chg_cur:%d\n", ret);

	printf("[power] set bat vol:%d\n", vol);
	ret = hal_power_set_chg_vol(&rdev, vol);
	printf("[power] _chg_vol:%d\n", ret);

	printf("[power] bat set test finish\n");
	return 0;
}
FINSH_FUNCTION_EXPORT_CMD(cmd_test_power_set_bat, test_power_set_bat, power hal APIs tests)

static int cmd_test_power_get_usb(int argc, const char **argv)
{
	int ret;
	struct power_dev rdev;
	printf("[power] get power\n");
	hal_power_get(&rdev);

	printf("[power] get usb_status\n");
	ret = hal_power_get_usb_status(&rdev);
	printf("[power] usb_status:%d\n", ret);

	printf("[power] usb_ihold\n");
	ret = hal_power_get_usb_ihold(&rdev);
	printf("[power] usb_ihold:%d\n", ret);

	printf("[power] get usb_vhold\n");
	ret = hal_power_get_usb_vhold(&rdev);
	printf("[power] usb_vhold:%d\n", ret);

	printf("[power] get cc_status\n");
	ret = hal_power_get_cc_status(&rdev);
	printf("[power] cc_status:%d\n", ret);

	printf("[power] usb get test finish\n");
	return 0;
}
FINSH_FUNCTION_EXPORT_CMD(cmd_test_power_get_usb, test_power_get_usb, power hal APIs tests)

static int cmd_test_power_set_usb(int argc, const char **argv)
{
	int ret;
	struct power_dev rdev;
    int cur = strtol(argv[1], NULL, 0);
    int vol = strtol(argv[2], NULL, 0);

	printf("[power] set usb power:cur:%d vol:%d\n", cur, vol);
	hal_power_get(&rdev);

	printf("[power] set usb_ihold:%d\n", cur);
	ret = hal_power_set_usb_ihold(&rdev, cur);
	printf("[power] usb_ihold:%d\n", ret);

	printf("[power] set usb_vhold:%d\n", vol);
	ret = hal_power_set_usb_vhold(&rdev, vol);
	printf("[power] usb_vhold:%d\n", ret);

	printf("[power] usb set test finish\n");
	return 0;
}
FINSH_FUNCTION_EXPORT_CMD(cmd_test_power_set_usb, test_power_set_usb, power hal APIs tests)
```

