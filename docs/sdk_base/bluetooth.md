# RTOS 蓝牙

本文档主要介绍 FreeRTOS 平台上 Bluetooth 开发，主要包括蓝牙配置介绍、蓝牙 API 接口介绍以及 demo 的使用。

## 蓝牙框架介绍

蓝牙框架如下图所示，从上往下可以划分为应用、中间件、适配层、驱动层，固件层，R128 芯片内置蓝牙模块，支持 BR/EDR、BLE 双模。在软件实现上，蓝牙 controller 运行在 ARM m33 CPU 上，蓝牙 HOST 运行在 RV C906 CPU 上。其中蓝牙 HOST 包含 bluedroid 和 zephyr 两个协议栈，bluedroid 协议栈提供 BR/EDR 功能支持，例如 A2DP Sink、A2DP Source、AVRCP、HFP HF、SPP 等 Profile，zephyr 协议栈提供 BLE 相关的功能支持，例如 GATT Client、GATT Server、Mesh 等。

![image-20230602172028629](assets/post/bluetooth/image-20230602172028629.png)

### 应用层

用户所开发的蓝牙应用，一般推荐使用中间件 btmanager API 进行应用开发。

### 中间件

中间件指 btmanager 软件，它向上提为应用提供 API，向下对接协议栈，屏蔽了协议栈使用细节，降低蓝牙应用开发门槛。本文档将会重点介绍如何使 btmanager 进行蓝牙应用开发

代码路径：

```
lichee/rtos‑components/aw/wireless/btmanager/src
```

### 协议栈

HOST 使用双栈方式支持 BR/EDR、BLE 蓝牙功能。BR/EDR 使用 Bluedroid 协议栈，BLE 使用 zephyr 协议栈。

bluedroid 协议栈路径：

```
lichee/rtos‑components/thirdparty/bluetooth/bluedroid
```

zephyr 协议栈路径：

```
lichee/rtos‑components/thirdparty/bluetooth/zephyr
```

### 适配层

适配层主要有两个作用：

- 对接不同协议栈
- 对接驱动层

代码路径：

```
lichee/rtos/components/aw/bluetooth/xradio
```

#### 适配层对接不同协议栈

适配层提供 bluedroid 和 zephyr 的 adapter，如下所示：

```
.
├── bluedroid
│   └── bt_bluedroid_adapter.c
├── Makefile
└── zephyr
	└── bt_zephyr_adapter.c
```

提供的接口如下：

```C
int bt_zephyr_adapter_register(void)
int bt_zephyr_adapter_unregister(void)
int bt_bluedroid_adapter_register(void)
int bt_bluedroid_adapter_unregister(void)
```

实现 adapter 主要填充实现 bt_hci_driver 接口，例如 hci 接口初始化、数据发送功能等。

```C
static const struct bt_hci_driver drv = {
	.name = "",
	.bus = BT_HCI_DRIVER_BUS_VIRTUAL,
	.open = virtual_hci_open,
#if defined(CONFIG_BT_DEINIT)
	.close = virtual_hci_close,
#endif
	.send = virtual_hci_h2c,
};
```

其中，在 `hci_open` 的时候，会注册数据接收回调，以 zephyr adater 为例：

```C
static bt_hc_callbacks_t zephyr_hc_callbacks = {
	.data_ind = zephyr_data_ind,
};

static int virtual_hci_open(void)
{
	bt_lib_if = bt_lib_get_interface();
	if (bt_lib_if && bt_lib_if‑>hci_ops && bt_lib_if‑>hci_ops‑>open) {
		bt_zephyr_id = bt_lib_if‑>hci_ops‑>open(BT_FEATURES_BLE, &zephyr_hc_callbacks);
		if (bt_zephyr_id >= 0)
		return 0;
	}
	return ‑1;
}
```

如果 controller 上报数据，就会通过 callback 调用到 zephyr_data_ind，把数据传递给协议栈。

#### 适配层对接驱动层

通过适配层的接口可以直接对 controller 使能：

```C
int bt_ctrl_enable(void)
int bt_ctrl_disable(void)
```

以上接口内部是通过 bt_lib_get_interface 获取到驱动层提供的接口完成 controller 初始化。

```C
if ((bt_lib_interface = bt_lib_get_interface()) && bt_lib_interface‑>init) {
	bt_lib_interface‑>init();
} else {
	BT_CTRL_ERR("BT LIB Interface not exist!\n");
	return ‑1;
}	
```

### 驱动层

驱动层为适配层提供接口，完成蓝牙硬件相关的初始化。

代码路径：
```
lichee/rtos/drivers/drv/bluetooth/xradio
```

目录结构如下：

```
├── driver
│   ├── common
│   ├── controller
│   ├── interface
│   ├── Kconfig
│   └── Makefile
├── hci_distribute
│   └── hci_distribute.c
├── include
│   ├── driver
│   ├── hci_distribute
│   └── lib
├── Kconfig
├── lib
│   └── bt_lib.c
└── Makefile
```

因为 R128 内置蓝牙，所以 HCI 使用 VHCI，而不是 UART 等物理接口。

为适配层提供接口，适配层可以通过 bt_lib_get_interface 获取到控制驱动的 btLibInterface。

```c
static const bt_lib_interface_t btLibInterface = {
    .init = bt_lib_init,
    .deinit = bt_lib_deinit,
    .hci_ops = &btHCLibInterface,
    .hci_ctrl_ops = &btHCLibCtrlInterface,
};
```

其中 bt_lib_init 可以完成 controller 初始化。btHCLibInterface 则是对 HCI 接口操作：

```c
static const bt_hc_interface_t btHCLibInterface = {
    .open = hci_open,
    .write = hci_write,
    .read = hci_read,
    .close = hci_close,
};
```

hci_open、hci_write 等在 VHCI 中实现。

### firmware

蓝牙固件是 libxrbtc.a 文件，路径如下：

```
lichee/rtos/drivers/drv/bluetooth/driver/controller/xradio/sun20iw2
```

M33 系统编译时会把 libxrbtc.a 编译上。

## 蓝牙配置说明

R128 芯片内置蓝牙，硬件无需外接蓝牙模组，蓝牙软件分别运行在两个核上：

- M33 核：蓝牙 Controller 的代码
- C906 核：蓝牙 Host 协议栈与应用代码

因此配置蓝牙功能分两部分说明，一般默认已经配置蓝牙，若功能异常，请参考说明检查配置。

###  M33 核

#### Driver

```
Drivers Options ‑‑‑>
    other drivers ‑‑‑>
        bluetooth drivers ‑‑‑>
        [*] BLUETOOTH xradio driver
        [*] Enable Blutooth Drivers Lib
        	Bluetooth Driver Controller (Xradio BT Controller) ‑‑‑>
        	xradio bt controller ‑‑‑>
        	Bluetooth Driver Interface (Virtual HCI) ‑‑‑>
        [ ] Enable Blutooth Drivers HCI Log Parse
        	Distribution method (Distribute Corresponding) ‑‑‑>
        [ ] corresponding mode debug log
        (2) Blutooth Drivers Lib Log Level
```

#### AMP

```
System components ‑‑‑>
    aw components ‑‑‑>
        AMP Components Support ‑‑‑>
            [*] AMP BT Support
            	[*] AMP Bluetooth Stub Functions
            	[*] AMP Bluetooth Service
```

### C906 核

#### Driver

```
Drivers Options ‑‑‑>
    other drivers ‑‑‑>
        bluetooth drivers ‑‑‑>
            [*] BLUETOOTH xradio driver
            [*] Enable Blutooth Drivers Lib
            	Bluetooth Driver Controller (Xradio BT Controller) ‑‑‑>
            	xradio bt controller ‑‑‑>
            	Bluetooth Driver Interface (Virtual HCI) ‑‑‑>
            [*] Enable Blutooth Drivers HCI Log Parse
            [ ] Enable Blutooth Drivers Log hcidump
            [*] Enable Blutooth Drivers Log btsnoop
            (512) The extra thread stack size of using FileSystem
            	Distribution method (Distribute Corresponding) ‑‑‑>
            [ ] corresponding mode debug log
            (1) Blutooth Drivers Lib Log Level
```

#### AMP

```
System components ‑‑‑>
    aw components ‑‑‑>
        AMP Components Support ‑‑‑>
            [*] AMP BT Support
            	[*] AMP Bluetooth Stub Functions
            	[*] AMP Bluetooth Service
```

#### 协议栈

BLE 使用 Zephyr 协议栈，BR/EDR 使用 Bluedroid 协议栈；

##### Zephyr

```
System components ‑‑‑>
	thirdparty components ‑‑‑>
        [*] bluetooth ‑‑‑>
            [*] Zephyr ‑‑‑>
                [*] Use iterable section instead with XRadio implement
                Max compiled‑in log level for bt (Info) ‑‑‑>
                Bluetooth Stack Selection (HCI‑based) ‑‑‑>
                [ ] RAW HCI access
                [*] Peripheral Role support
                [*] Central Role support
                [ ] Extended Advertising and Scanning support [EXPERIMENTAL]
                (5) Maximum number of simultaneous connections
                [ ] Controller to Host ACL flow control support
                [*] Enable fetching of remote version
                [*] PHY Update
                [*] Data Length Update
                [*] BLE Deinit
                [ ] BLE Global Variable Memory Dynamic Allocation
                [*] Custom Bluetooth assert implementation
                [*] Print out an assert string when using BT_ASSERT
                [ ] Use k_panic() instead of k_oops()
                Bluetooth debug type (No debug log) ‑‑‑>
                Networking ‑‑‑>
                Debugging Options ‑‑‑>
                [*] Logging ‑‑‑>
                [*] Enable settings subsystem with non‑volatile storage ‑‑‑>
                Work Queue Options ‑‑‑>
                [*] Store kernel timeouts in 64 bit precision
                *** Host Stack Configuration ***
                (2) Number of HCI command buffers
                (20) Number of HCI RX buffers
                (88) Maximum supported HCI RX buffer length
                (20) Number of discardable event buffers
                (88) Size of discardable event buffers
                (1024) HCI ECC thread stack size
                (2200) Size of the receiving thread stack
                [*] Load CCC values from settings when peer connects
                [ ] Store CCC value immediately after it has been written
                [*] Enable whitelist support
                (3) Maximum number of pending TX buffers with a callback
                [*] User control of PHY Update Procedure
                [ ] Auto‑initiate PHY Update Procedure
                [*] User control of Data Length Update Procedure
                [ ] Auto‑initiate Data Length Update procedure
                [*] Enable application access to remote information
                [*] Enable remote version information
                [*] Security Manager Protocol support
                [*] Privacy Feature
                (900) Resolvable Private Address timeout
                [*] Data signing support
                [*] Accept or reject pairing initiative
                [ ] Disable legacy pairing
                [ ] Secure Connections Only Mode
                [ ] Force Out Of Band Legacy pairing
                [*] Allow unauthenticated pairing for paired device
                [ ] Forbid usage of insecure legacy pairing methods
                [*] Allow unauthenticated pairing for paired device
                [ ] Use a fixed passkey for pairing
                [ ] Enable Security Manager Debug Mode
                [*] Bondable Mode
                [ ] Always require bonding
                [ ] Store Debug Mode bonds
                [*] Enforce MITM protection
                [*] Overwrite oldest keys with new ones if key storage is full
                [ ] Store aging counter every time a successful paring occurs
                L2CAP Options ‑‑‑>
                ATT and GATT Options ‑‑‑>
                (5) Maximum number of paired devices
                (3) Timeout for pending LE Create Connection command in seconds
                (5000) Peripheral connection parameter update timeout in milliseconds
                (2048) Scan interval used for background scanning in 0.625 ms units
                (18) Scan window used for background scanning in 0.625 ms units
                [*] Allow to set Bluetooth device name on runtime
                (28) Maximum size in bytes for device name
                (Xradio) Bluetooth device name
                (0) Bluetooth device appearance
                (2) Maximum number of local identities
                [ ] Enable Direction Finding support [EXPERIMENTAL]
                ‑*‑ Enable ECDH key generation support
                [*] Emulate ECDH in the Host using TinyCrypt library
                ‑*‑ Enable host side AES‑CCM module
                [ ] Bluetooth Testing
                [ ] User Vendor‑Specific event handling
                (0x05F1) Company Id
                [*] Bluetooth Mesh support ‑‑‑>
```

##### Bluedroid

```
System components ‑‑‑>
    thirdparty components ‑‑‑>
        [*] bluetooth ‑‑‑>
            [*] Bluedroid ‑‑‑>
                [*] Bluedroid enable
                [*] Bluedroid ‑ Dual‑mode
                [*] Bluedroid Host
                Bluedroid‑BT Options ‑‑‑>
                (4096) Bluetooth event (callback to application) task stack size
                The cpu core which Bluedroid run (Core 0 (PRO CPU)) ‑‑‑>
                (4096) Bluetooth Bluedroid Host Stack task stack size
                [ ] Bluedroid memory debug
                [*] Classic Bluetooth
                [*] A2DP
                [*] SPP
                [*] Hands Free/Handset Profile
                	Hands‑free Profile Role configuration (Hands Free Unit) ‑‑‑>
                	audio(SCO) data path (HCI) ‑‑‑>
                [*] Wide Band Speech
                [ ] Classic BT HID Host
                [*] Secure Simple Pairing
                [ ] Bluetooth Low Energy
                [ ] Disable BT debug logs (minimize bin size)
                BT DEBUG LOG LEVEL ‑‑‑>
                (4) BT/BLE MAX ACL CONNECTIONS(1~7)
                [ ] BT/BLE will first malloc the memory from the PSRAM
                [*] Use dynamic memory allocation in BT/BLE stack
                [*] BLE queue congestion check
                (30) Timeout of BLE connection establishment
                (248) Maximum size in bytes for bredr device name
            XRADIO_COMMON ‑‑‑>
                [*] HCI LAYER RX support
                [*] hcilog enable
                [*] A2dp source process feature support
                (1) hcidmp buffer
                [*] bluedroid use settings
                (8) bluedroid max store value
                (1536) bluedroid max file size
                (2048) bluedroid file defaule length
                (bt_cfg_key) bluedroid store key name
                (2) bluedroid log defaule level
```

#### btmanager

btmanager 配置如下

```
System components ‑‑‑>
    aw components ‑‑‑>
        wireless ‑‑‑>
        [*] btmanager ‑‑‑>
            [*] btmg core
            [ ] Enable AudioTrack send audio data
            [*] btmg cmd
```

其中 “Enable AudioTrack send audio data” 默认不打开，如果需要使用 AudioTrack 接管 A2DP Source 蓝牙音乐播放需要选上。

选上之后，通过 btcli demo 将无法测试 A2DP Source 蓝牙，请参考 as_test demo 使用。

#### Tools

常用的蓝牙工具有 btetf 和 btsnoop

##### btetf 

```
System components ‑‑‑>
    aw components ‑‑‑>
        aw bluetooth ‑‑‑>
            [*] etf
```

##### btsnoop

用于抓 hci log，默认打开

```
Drivers Options ‑‑‑>
    other drivers ‑‑‑>
        bluetooth drivers ‑‑‑>
        	[*] Enable Blutooth Drivers Log btsnoop
```

## BR/EDR 开发介绍

### 基础 API

| API 接口                       | 说明                                                         |
| ------------------------------ | ------------------------------------------------------------ |
| btmg_core_init                 | btmanager 内部资源初始化接口，进行内存资源申请               |
| btmg_core_deinit               | btmanager 内部资源发始化接口                                 |
| btmg_set_profile               | 设置蓝牙 profile 功能，在 btmg_adapter_enable() 之前设置有效，在用户未反初始化退出的情况下该设置一直生效 |
| btmg_set_loglevel              | 设置 btmanager 内部打印等级，默认打印等级是BTMG_LOG_LEVEL_WARNG |
| btmg_get_loglevel              | 获取 btmanager 内部当前使用的打印等级                        |
| btmg_set_ex_debug              | 设置拓展调试标志位，用于打开特殊打印输出                     |
| btmg_get_ex_debug              | 获取当前设置拓展调试标志位的值                               |
| btmg_get_error_info            | 获取错误信息                                                 |
| btmg_adapter_enable            | 开关蓝牙的作用，会进行 firmware 和蓝牙协议栈等初始化/反初始化 |
| btmg_adapter_get_state         | 获取蓝牙开关状态                                             |
| btmg_adapter_get_address       | 获取本地蓝牙设备地址                                         |
| btmg_adapter_set_name          | 设置本地蓝牙设备名称                                         |
| btmg_adapter_get_name          | 获取本地蓝牙设备名称                                         |
| btmg_adapter_set_scanmode      | 设置本地 BT 设备扫描模式（PSCAN,ISCAN），决定设备是否可连接，可发现 |
| btmg_adapter_set_io_capability | 设置本地蓝牙设备的输入、输出能力                             |
| btmg_adapter_start_scan        | 开始扫描周围的蓝牙设备                                       |
| btmg_adapter_stop_scan         | 停止 BT 扫描                                                 |
| btmg_adapter_is_scanning       | 获得当前 BT 扫描状态                                         |
| btmg_adapter_pair_device       | 发起蓝牙配对                                                 |
| btmg_adapter_unpair_device     | 取消蓝牙配对                                                 |
| btmg_get_paired_device_num     | 获取已配对设备数量                                           |
| btmg_get_paired_devices        | 获取所有已配对设备信息                                       |
| btmg_set_page_timeout          | N/A                                                          |
| btmg_device_is_connected       | 判断对端设备是否跟本地设备存在连接关系                       |
| btmg_device_get_name           | 获取指定蓝牙设备的名称                                       |
| btmg_device_remove             | N/A                                                          |
| btmg_device_pincode_reply      | 回复 pincode                                                 |
| btmg_device_passkey_reply      | 回复 passkey                                                 |
| btmg_device_passkey_confirm    | 确认 passkey                                                 |
| btmg_device_pairing_confirm    | 确认配对                                                     |

