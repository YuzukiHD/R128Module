# PMU 电源管理

## BMU 功能简介

目前已支持的BMU 为：AXP2585。

该BMU 主要用于电池管理以及充电管理，主要有以下功能：
1. 读取电池电量、电池温度。
2. 设置充电时的充电电流，截止充电电压、充电超时等。
3. 自动根据连接PC 或者适配器设置USB 输入的最大限流。
4. 电池温度过高时自动触发停充。
5. 检测USB 线的接入和拔出。
6. BMU 芯片过温保护。

## BMU 配置介绍

### `sys_config.fex` 配置说明

```ini
[pmu]
pmu_irq_pin      = port:PA14<14><0><default><default>
pmu_irq_wakeup   = 2
pmu_hot_shutdown = 1
pmu_bat_unused = 0
pmu_usbad_vol = 4600
pmu_usbad_cur = 1500
pmu_usbpc_vol = 4600
pmu_usbpc_cur = 500
pmu_chg_ic_temp = 0
pmu_battery_rdc = 100
pmu_battery_cap = 3568
pmu_runtime_chgcur = 900
pmu_suspend_chgcur = 1200
pmu_shutdown_chgcur = 1200
pmu_init_chgvol = 4200
pmu_init_chg_pretime = 50
pmu_init_chg_csttime = 1200
pmu_chgled_type = 0
pmu_init_bc_en = 1
pmu_bat_temp_enable = 0
pmu_bat_charge_ltf = 2261
pmu_bat_charge_htf = 388
pmu_bat_shutdown_ltf = 3200
pmu_bat_shutdown_htf = 237
pmu_bat_para[0] = 0
pmu_bat_para[1] = 0
pmu_bat_para[2] = 0
pmu_bat_para[3] = 0
pmu_bat_para[4] = 0
pmu_bat_para[5] = 0
pmu_bat_para[6] = 1
pmu_bat_para[7] = 1
pmu_bat_para[8] = 2
pmu_bat_para[9] = 4
pmu_bat_para[10] = 5
pmu_bat_para[11] = 12
pmu_bat_para[12] = 19
pmu_bat_para[13] = 32
pmu_bat_para[14] = 41
pmu_bat_para[15] = 45
pmu_bat_para[16] = 48
pmu_bat_para[17] = 51
pmu_bat_para[18] = 54
pmu_bat_para[19] = 59
pmu_bat_para[20] = 63
pmu_bat_para[21] = 68
pmu_bat_para[22] = 71
pmu_bat_para[23] = 74
pmu_bat_para[24] = 78
pmu_bat_para[25] = 81
pmu_bat_para[26] = 82
pmu_bat_para[27] = 84
pmu_bat_para[28] = 88
pmu_bat_para[29] = 92
pmu_bat_para[30] = 96
pmu_bat_para[31] = 100
pmu_bat_temp_para[0] = 7466
pmu_bat_temp_para[1] = 4480
pmu_bat_temp_para[2] = 3518
pmu_bat_temp_para[3] = 2786
pmu_bat_temp_para[4] = 2223
pmu_bat_temp_para[5] = 1788
pmu_bat_temp_para[6] = 1448
pmu_bat_temp_para[7] = 969
pmu_bat_temp_para[8] = 664
pmu_bat_temp_para[9] = 466
pmu_bat_temp_para[10] = 393
pmu_bat_temp_para[11] = 333
pmu_bat_temp_para[12] = 283
pmu_bat_temp_para[13] = 242
pmu_bat_temp_para[14] = 179
pmu_bat_temp_para[15] = 134
```

配置含义：

```c
pmu_irq_pin
	AXP芯片IRQ引脚连接的IO，用于触发中断

pmu_irq_wakeup
	Press irq wakeup or not when sleep or power down.
    0: not wakeup
    1: wakeup
    
pmu_hot_shutdown
    when PMU over temperature protect or not.
    0: disable
    1: enable

pmu_bat_unused
    unused bat
    0: disable
    1: enable

pmu_usbpc_vol <u32>
	usb pc输入电压限制值，单位为mV
	
pmu_usbpc_cur <u32>
	usb pc输入电流限制值，单位为mA
	
pmu_usbad_vol <u32>
	usb adaptor输入电压限制值(vimdpm)，单位为mV
	
pmu_usbad_cur <u32>
	usb adaptor输入电流限制值，单位为mA
	
pmu_chg_ic_temp <u32>
    1: TS current source always on
    0: TS current source off
    
pmu_battery_rdc <u32>
	电池内阻，单位为mΩ
	
pmu_battery_cap <u32>
	电池容量，单位为mAh
	
pmu_runtime_chgcur <u32>
	运行时constant充电电流限制，单位为mA
	
pmu_suspend_chgcur <u32>
	休眠时constant充电电流限制，单位为mA
	
pmu_shutdown_chgcur <u32>
	关机时constant充电电流限制，单位为mA
	
pmu_terminal_chgcur <u32>
	截止电流，停止充电的标志位之一，单位为mA
	
pmu_init_chgvol <u32>
	电池满充电压，单位为mV
	
pmu_init_chg_pretime <u32>
	当电池电压低于REG 0x8C[1]时，属于pre charge阶段。
	如果此阶段时间超过pmu_init_chg_pretime，视为超时，停止充电。
	
pmu_init_chg_csttime <u32>
	当电池电压高于REG 0x8C[1]且低于截止电压(REG 0X8C[7:2])时，属于恒流充电阶段。
	如果此阶段时间超过pmu_init_chg_csttime，视为超时，停止充电。
	
pmu_chgled_type <bool>
    0: Enable CHGLED pin funciton
    1: Disable CHGLED pin funciton
    
pmu_init_bc_en <bool>
    0: Enable BC1.2
    1: Disable BC1.2
        
pmu_bat_temp_enable <u32>
	设置电池温度检测、ntc是否使能
        
pmu_bat_charge_ltf <u32>
    触发电池低温停充的TS pin电压阈值，单位：mV
    默认：1105mV
    范围：0‑8160mV
        
pmu_bat_charge_htf <u32>
    触发电池高温停充的TS pin电压阈值，单位：mV
    默认：121mV
    范围：0‑510mV
        
pmu_bat_shutdown_ltf <u32>
	非充电模式下，触发电池低温中断的TS pin电压阈值，单位：mV
	默认：1381mV
        
pmu_bat_shutdown_htf <u32>
	默认：89mV
	范围：0‑510mV
        
pmu_bat_para1 <u32>
pmu_bat_para2 <u32>
...
pmu_bat_para32 <u32>
	电池曲线参数
	电池参数根据使用的电池不同，通过仪器测量出来
        
pmu_bat_temp_para1 <u32>
	电池包‑25度对应的TS pin电压，单位：mV
        
pmu_bat_temp_para2 <u32>
	电池包‑15度对应的TS pin电压，单位：mV
        
pmu_bat_temp_para3 <u32>
	电池包‑10度对应的TS pin电压，单位：mV
        
pmu_bat_temp_para4 <u32>
	电池包‑5度对应的TS pin电压，单位：mV
        
pmu_bat_temp_para5 <u32>
	电池包0度对应的TS pin电压，单位：mV
        
pmu_bat_temp_para6 <u32>
	电池包5度对应的TS pin电压，单位：mV
        
pmu_bat_temp_para7 <u32>
	电池包10度对应的TS pin电压，单位：mV
        
pmu_bat_temp_para8 <u32>
	电池包20度对应的TS pin电压，单位：mV
        
pmu_bat_temp_para9 <u32>
	电池包30度对应的TS pin电压，单位：mV
        
pmu_bat_temp_para10 <u32>
	电池包40度对应的TS pin电压，单位：mV
        
pmu_bat_temp_para11 <u32>
	电池包45度对应的TS pin电压，单位：mV
        
pmu_bat_temp_para12 <u32>
	电池包50度对应的TS pin电压，单位：mV
        
pmu_bat_temp_para13 <u32>
	电池包55度对应的TS pin电压，单位：mV
        
pmu_bat_temp_para14 <u32>
	电池包60度对应的TS pin电压，单位：mV
        
pmu_bat_temp_para15 <u32>
	电池包70度对应的TS pin电压，单位：mV
        
pmu_bat_temp_para16 <u32>
	电池包80度对应的TS pin电压，单位：mV

不同电池包的温敏电阻特性不一样，根据电池包的TS温敏电阻手册，找到pmu_bat_temp_para[1‑16]对应温度点的电阻阻值，将阻值除以20得到的电压数值（单位：mV），将电压数值填进pmu_bat_temp_para[1‑16]的节点中即可
```

### rtos menuconfig 配置说明

AXP 是依赖于I2C 进行通过的，所以首先就需要确认I2C 驱动是已经被选上的。

- 使能I2C 驱动

```
‑> Drivers Options
    ‑> soc related device drivers
        ‑> TWI Devices
            [*] enable twi driver
```

- 使能PMU 驱动

```
‑> Drivers Options
	‑> soc related device drivers
		[*] POWER Devices
```

- 选择AXP2585

```
‑> Drivers Options
	‑> soc related device drivers
		‑> POWER Devices
			[*] enable power driver
```

### BMU 源码结构

```
lichee/rtos‑hal/hal/source/power/
├── axp2585.c
├── axp2585.h
├── axp.c
├── axp_twi.c
├── ffs.h
├── Kconfig
├── Makefile
├── sun20iw2p1
│ ├── core.c
└── type.h
```

- axp2585.c: AXP2585 驱动。
-  axp.c: AXP 框架API 接口。
-  axp_twi.c: 初始化以及I2C 接口。
-  sun20iw2p1: R128 配置以及总初始化接口。

## BMU 常用功能

### 驱动初始化

若 `mrtos_menuconfig` 中已经选上了该设备，并且 `sys_config.fex`  中也配置完成，那么系统加载时就已经自动将 BMU 驱动加载完成，无需软件工程师再进行初始化。

初始化成功的 log 可如下所示：

```
axp2585 chip version C !
axp2585 chip id detect 0x49 !
current limit not set: usb adapter type
axp2585 init finished !
```

若是没有打印上述的打印 log 信息，可能是 BMU 驱动加载失败了，可以从 `sys_config.fex` 配置中确认是否有配置漏配置了，或者是从 I2C 方向去排查，确认I2C 通信是正常的。

### AXP 接口使用

BMU 驱动有一个统一的驱动入口，初始化和一些功能接口，都是由AXP 驱动统一管理的。具体请参照 [PMU](/sdk_module/pmu)章节的说明。

### 电源管理应用healthd

healthd 是一个电源管理的应用，主要功能为：检测电池电量、设置充电电流、电量变低警报、电压过低关机、电池温度过高过度保护等等。

应用配置方法：

```
‑> System components
	‑> aw components
		[*] healthd for axp
```

应用源码路径为：

```
lichee/rtos/components/aw/healthd/healthd.c
```

#### healthd 用法

##### 开启应用

应用在默认SDK 中并不会启动，在系统启动之后，需要手动输入：

```
healthd
```

然后就开启了电池管理应用了。开启了之后，就会启动了电量变低警报、电压过低关机、电池温度过高过度保护的功能。

##### 获取电池电量

运行命令：

```
healthd_get_capacity
```

##### 设置充电电流

运行命令：

```
healthd_set_chgcur 1500
```

命令的后缀为充电电流大小，单位为mA，范围为0~3072mA。

