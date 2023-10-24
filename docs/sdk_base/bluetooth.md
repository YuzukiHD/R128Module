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

### A2DP Sink 开发 API

A2DP Sink 设备一般作为音箱类产品，会被手机等 A2DP Source 设备连接并推送音频流播放音乐

| API 接口                  | 说明                                          |
| ------------------------- | --------------------------------------------- |
| btmg_a2dp_sink_connect    | 连接指定 A2DP Source 设备，可用于回连功能开发 |
| btmg_a2dp_sink_disconnect | 主动断开与指定设备的连接                      |

####  A2DP Sink API 调用流程

关于 A2DP Sink 功能的实现，已编写了使用示例，执行 `btcli init ‑p a2dp‑sink` 即可运行，供用户使用参考，代码如下：

```c
#include "cmd_util.h"
#include <stdio.h>
#include <stdlib.h>
#include <getopt.h>

#include "btmg_dev_list.h"
#include "bt_manager.h"

btmg_callback_t btmg_cbs;
dev_list_t *discovered_devices = NULL;

#ifdef CONFIG_BT_A2DP_ENABLE
extern void btcli_a2dp_source_connection_state_cb(const char *bd_addr,
                                                  btmg_a2dp_source_connection_state_t state);
extern void btcli_a2dp_source_audio_state_cb(const char *bd_addr,
                                             btmg_a2dp_source_audio_state_t state);
extern void btcli_a2dp_sink_connection_state_cb(const char *bd_addr,
                                                btmg_a2dp_sink_connection_state_t state);
extern void btcli_a2dp_sink_audio_state_cb(const char *bd_addr, btmg_a2dp_sink_audio_state_t state);
extern void btcli_avrcp_ct_play_state_cb(const char *bd_addr, btmg_avrcp_play_state_t state);
extern void btcli_avrcp_ct_track_changed_cb(const char *bd_addr, btmg_track_info_t *track_info);
extern void btcli_avrcp_ct_play_position_cb(const char *bd_addr, int song_len, int song_pos);
extern void btcli_avrcp_audio_volume_cb(const char *bd_addr, unsigned int volume);
extern void btcli_avrcp_tg_play_state_cb(const char *bd_addr, btmg_avrcp_play_state_t state);
#endif
#ifdef CONFIG_BT_SPP_ENABLED
extern void btcli_sppc_conn_status_cb(const char *bd_addr, btmg_spp_connection_state_t status);
extern void btcli_sppc_recvdata_cb(const char *bd_addr, char *data, int data_len);
extern void btcli_spps_conn_status_cb(const char *bd_addr, btmg_spp_connection_state_t status);
extern void btcli_spps_recvdata_cb(const char *bd_addr, char *data, int data_len);
#endif
#ifdef CONFIG_BT_HFP_CLIENT_ENABLE
extern void btcli_hfp_hf_event_cb(btmg_hfp_hf_event_t event, void *data);
extern void btcli_hfp_hf_connection_state_cb(const char *bd_addr,
                                             btmg_hfp_hf_connection_state_t state);
#endif
#ifdef CONFIG_BT_HFP_AG_ENABLE
extern void btcli_hfp_ag_event_cb(btmg_hfp_ag_event_t event, void *data);
extern void btcli_hfp_ag_connection_state_cb(const char *bd_addr,
                                             btmg_hfp_ag_connection_state_t state);
extern void btcli_hfp_ag_audio_incoming_cb(const uint8_t *buf, uint32_t sz);
extern uint32_t btcli_hfp_ag_audio_outgoing_cb(uint8_t *p_buf, uint32_t sz);
#endif
extern void btcli_ble_scan_cb(le_scan_cb_para_t *data);
extern void btcli_ble_connection_cb(le_connection_para_t *data);
extern void btcli_gattc_dis_att_cb(gattc_dis_cb_para_t *data);
extern void btcli_gattc_notify_indicate_cb(gattc_notify_indicate_cb_para_t *data);
extern void btcli_gatts_get_db_cb(gatts_get_db_t *data);
extern void btcli_gatts_char_read_req_cb(gatts_char_read_req_t *data);
extern void btcli_gatts_char_write_req_cb(gatts_char_write_req_t *data);
extern void btcli_gatts_ccc_cfg_cb(gatts_ccc_cfg_t *data);
extern void btcli_gattc_read_cb(gattc_read_cb_para_t *data);
extern void btcli_gattc_write_cb(gattc_write_cb_para_t *data);

#define AUTH_IDLE            0
#define AUTH_PIN_CODE        1
#define AUTH_ENTER_PASSKEY   2
#define AUTH_PASSKEY_CONFIRM 3
#define AUTH_PAIRING_CONFIRM 4

typedef struct {
    char addr[18];
    uint32_t passkey;
    uint8_t flag; //0:none 1:pin code 2:enter passkey 3:passkey_confirm 4: pairing confirm
} pair_req_t;

static btmg_gatt_db_t *db;
static int ble_gatt_register_service(void)
{
    if (db != NULL) {
        CMD_ERR("gatt already registered\n");
        return 0;
    }

    btmg_uuid_t uuid;
    btmg_gatt_properties_t prop;
    btmg_gatt_permission_t perm = BTMG_GATT_PERM_READ | BTMG_GATT_PERM_WRITE;

    /* service1 start, uuid=0xABCD */
    db = btmg_gatt_attr_create(12); //CHAR+2 other+1
    uuid.type = BTMG_UUID_16;
    uuid.value.u16 = 0xABCD;
    btmg_gatt_attr_primary_service(db, uuid); // +1

    uuid.value.u16 = 0xfff2;
    prop = BTMG_GATT_CHRC_READ | BTMG_GATT_CHRC_WRITE;
    btmg_gatt_attr_characteristic(db, uuid, prop, perm); // +2

    uuid.value.u16 = 0xfff3;
    prop = BTMG_GATT_CHRC_READ | BTMG_GATT_CHRC_WRITE | BTMG_GATT_CHRC_NOTIFY | BTMG_GATT_CHRC_INDICATE;
    btmg_gatt_attr_characteristic(db, uuid, prop, perm); // +2
    btmg_gatt_attr_ccc(db, perm);                        // +1
    /* service1 end*/
    /* service2 start, uuid=0x7788 */
    uuid.type = BTMG_UUID_16;
    uuid.value.u16 = 0x7788;
    btmg_gatt_attr_primary_service(db, uuid); // +1

    uuid.value.u16 = 0x1122;
    prop = BTMG_GATT_CHRC_READ;
    btmg_gatt_attr_characteristic(db, uuid, prop, perm); // +2

    uuid.value.u16 = 0x3344;
    prop = BTMG_GATT_CHRC_READ | BTMG_GATT_CHRC_WRITE | BTMG_GATT_CHRC_NOTIFY;
    btmg_gatt_attr_characteristic(db, uuid, prop, perm); // +2
    btmg_gatt_attr_ccc(db, perm);                        // +1
    /* service2 end*/

    btmg_gatt_register_service(db);

    return CMD_STATUS_OK;
}

static int ble_gatt_unregister_service(void)
{
    if (db == NULL) {
        CMD_ERR("gatt already unregistered\n");
        return 0;
    }

    btmg_gatt_unregister_service(db);

    return CMD_STATUS_OK;
}

static int ble_set_adv_data(void)
{
    int index = 0;
    uint16_t uuid = 0x1234;
    char ble_name[] = "aw-btcli-ble";

    btmg_adv_scan_rsp_data_t adv_data;

    adv_data.data[index] = 0x02; /* flag len */
    adv_data.data[index + 1] = 0x01; /* type for flag */
    adv_data.data[index + 2] = 0x1A; //0x05

    index += adv_data.data[index] + 1;

    adv_data.data[index] = strlen(ble_name) + 1; /* name len */
    adv_data.data[index + 1] = 0x09; /* type for local name */
    int name_len;
    name_len = strlen(ble_name);
    strcpy(&(adv_data.data[index + 2]), ble_name);
    index += adv_data.data[index] + 1;

    adv_data.data[index] = 0x03; /* uuid len */
    adv_data.data[index + 1] = 0x03; /* type for complete list of 16-bit uuid */
    adv_data.data[index + 2] = (char)(uuid & 0xFF);
    adv_data.data[index + 3] = (char)((uuid >> 8) & 0xFF);
    index += adv_data.data[index] + 1;

    adv_data.data_len = index;

    return btmg_le_set_adv_scan_rsp_data(&adv_data, NULL);
}

static int ble_advertise_on(void)
{
    btmg_le_adv_param_t adv_param;

    adv_param.interval_min = 0x0020;
    adv_param.interval_max = 0x01E0;
    adv_param.adv_type = BTMG_LE_ADV_IND;

    btmg_le_set_adv_param(&adv_param);
    ble_set_adv_data();
    return btmg_le_enable_adv(true);
}

static pair_req_t pair_req = { { 0 }, 0, 0 };

void btcli_scan_status_cb(btmg_scan_state_t status)
{
    if (status == BTMG_SCAN_STARTED) {
        CMD_DBG("start scanning\n");
    } else if (status == BTMG_SCAN_STOPPED) {
        CMD_DBG("stop scanning\n");
    }
}

void btcli_scan_dev_add_cb(btmg_device_t *device)
{
    dev_node_t *dev_node = NULL;

    CMD_DBG("name:[%s]\t\taddress:[%s]\t\tclass:[%d]\t\trssi:[%d]\n", device->name, device->address,
            device->cod, device->rssi);

    dev_node = btmg_dev_list_find_device(discovered_devices, device->address);
    if (dev_node != NULL) {
        return;
    }

    btmg_dev_list_add_device(discovered_devices, device->name, device->address, 0);
}

void btcli_adapter_name_cb(char *name)
{
    CMD_DBG("btcli get adapter name:%s\n", name);
}

void btcli_device_name_cb(char *name)
{
    CMD_DBG("btcli get remote device name:%s\n", name);
}

void btcli_bonded_device_cb(btmg_bond_state_t state, const char *bd_addr)
{
    dev_node_t *dev_discovered_node = NULL;

    CMD_DBG("bonded device state:%d, addr:%s\n", state, bd_addr);

    dev_discovered_node = btmg_dev_list_find_device(discovered_devices, bd_addr);
    if (state == BTMG_BOND_STATE_BONDED) {
        if (dev_discovered_node != NULL) {
            btmg_dev_list_remove_device(discovered_devices, bd_addr);
        }
        CMD_DBG("Pairing state for %s is BONDED \n", bd_addr);
    } else if (state == BTMG_BOND_STATE_BOND_FAILED) {
        CMD_DBG("Pairing state for %s is BOND_FAILED \n", bd_addr);
    }
}

void btcli_device_pindcoe_request_cb(const char *addr)
{
    CMD_DBG("dev:%s,pindcoe request, Please enter pincode\n", addr);
    memcpy(pair_req.addr, addr, sizeof(pair_req.addr));
    pair_req.flag = AUTH_PIN_CODE;
}

void btcli_device_passkey_request_cb(const char *addr)
{
    CMD_DBG("dev:%s,passkey_request, Please enter passkey!\n", addr);
    memcpy(pair_req.addr, addr, sizeof(pair_req.addr));
    pair_req.flag = AUTH_ENTER_PASSKEY;
}

void btcli_device_passkey_confirm_cb(const char *addr, uint32_t passkey)
{
    CMD_DBG("please confirm the passkey(%d) sent by the %s device!\n", passkey, addr);
    memcpy(pair_req.addr, addr, sizeof(pair_req.addr));
    pair_req.passkey = passkey;
    pair_req.flag = AUTH_PASSKEY_CONFIRM;
}

void btcli_device_pairing_confirm_cb(const char *addr, uint32_t passkey)
{
    CMD_DBG("dev:%s,pairing_confirm,please compare the passkey numeric value: %d\n", addr, passkey);
    memcpy(pair_req.addr, addr, sizeof(pair_req.addr));
    pair_req.passkey = passkey;
    pair_req.flag = AUTH_PAIRING_CONFIRM;
}

void btcli_adapter_status_cb(btmg_adapter_state_t status)
{
    char bt_addr[18] = { 0 };
    char bt_name_buf[64] = { 0 };
    char bt_name[64] = { 0 };

    if (status == BTMG_ADAPTER_OFF) {
        CMD_DBG("BT is off\n");
    } else if (status == BTMG_ADAPTER_ON) {
        CMD_DBG("BT is on\n");
        btmg_adapter_get_address(bt_addr);
        if (bt_addr[0] != '\0') {
            snprintf(bt_name_buf, 12, "aw-btcli-%s-", (char *)(bt_addr + 12));
            sprintf(bt_name, "%s-%s", bt_name_buf, (char *)(bt_addr + 15));
            btmg_adapter_set_name(bt_name);
        } else {
            btmg_adapter_set_name("aw-btcli");
        }
        btmg_adapter_set_io_capability(BTMG_IO_CAP_NOINPUTNOOUTPUT);
        btmg_adapter_set_scanmode(BTMG_SCAN_MODE_CONNECTABLE_DISCOVERABLE);
    } else if (status == BTMG_ADAPTER_TURNING_ON) {
        CMD_DBG("BT is turnning on\n");
    } else if (status == BTMG_ADAPTER_TURNING_OFF) {
        CMD_DBG("BT is turnning off\n");
    }
}

/* btcli pincode <0000~9999> */
enum cmd_status btcli_pincode(char *cmd)
{
    if (pair_req.flag != AUTH_PIN_CODE) {
        CMD_ERR("No need to enter pin code now\n");
        return CMD_STATUS_FAIL;
    }

    int argc;
    char *argv[1];

    argc = cmd_parse_argv(cmd, argv, 1);
    if (argc < 1) {
        CMD_ERR("invalid param number %d\n", argv[0]);
        return CMD_STATUS_INVALID_ARG;
    }

    btmg_device_pincode_reply(argv[0]);
    pair_req.flag = AUTH_IDLE;

    return CMD_STATUS_OK;
}

#if (BT_SSP_INCLUDED == TRUE)
/* btcli passkey <000000~999999> */
enum cmd_status btcli_passkey(char *cmd)
{
    if (pair_req.flag != AUTH_ENTER_PASSKEY) {
        CMD_ERR("No need to enter passkey now\n");
        return CMD_STATUS_FAIL;
    }

    uint32_t passkey = 0;
    int argc;
    char *argv[1];

    argc = cmd_parse_argv(cmd, argv, 1);
    if (argc < 1) {
        CMD_ERR("invalid param number %d\n", argc);
        return CMD_STATUS_INVALID_ARG;
    }
    passkey = atoi(argv[0]);
    if (passkey > 999999) {
        CMD_ERR("Passkey should be between 0-999999");
        return CMD_STATUS_INVALID_ARG;
    }

    btmg_device_passkey_reply(passkey);
    pair_req.flag = AUTH_IDLE;

    return CMD_STATUS_OK;
}

/* btcli passkey_confirm */
enum cmd_status btcli_passkey_confirm(char *cmd)
{
    if (pair_req.flag != AUTH_PASSKEY_CONFIRM) {
        CMD_ERR("No need to enter this command now\n");
        return CMD_STATUS_FAIL;
    }

    btmg_device_passkey_confirm(pair_req.passkey);
    pair_req.flag = AUTH_IDLE;

    return CMD_STATUS_OK;
}

/* btcli pairing_confirm */
enum cmd_status btcli_pairing_confirm(char *cmd)
{
    if (pair_req.flag != AUTH_PAIRING_CONFIRM) {
        CMD_ERR("No need to need to enter this command now\n");
        return CMD_STATUS_FAIL;
    }

    btmg_device_pairing_confirm();
    pair_req.flag = AUTH_IDLE;

    return CMD_STATUS_OK;
}
#endif

/* btcli scan_list */
enum cmd_status btcli_scan_list(char *cmd)
{
    dev_node_t *dev_node = NULL;

    if (discovered_devices == NULL) {
        CMD_WRN("scan list is empty\n");
        return CMD_STATUS_OK;
    }

    dev_node = discovered_devices->head;
    while (dev_node != NULL) {
        CMD_DBG("addr: %s, name: %s\n", dev_node->dev_addr, dev_node->dev_name);
        dev_node = dev_node->next;
    }

    return CMD_STATUS_OK;
}

/* btcli paired_list */
enum cmd_status btcli_paired_list(char *cmd)
{
    int device_num = -1;
    btmg_err ret;

    btmg_get_paired_device_num(&device_num);
    if (device_num <= 0) {
        CMD_DBG("no device is bonded!\n");
        return CMD_STATUS_OK;
    }

    btmg_paired_device_t paired_list[device_num];

    if ((ret = btmg_get_paired_devices(device_num, paired_list)) != BT_OK) {
        CMD_ERR("return failed: %d\n", ret);
        return CMD_STATUS_FAIL;
    }

    CMD_DBG("get paired device_list:\n");
    for (int i = 0; i < device_num; i++) {
        CMD_DBG("device[%s]\n", paired_list[i].address);
    }

    return CMD_STATUS_OK;
}

/* btcli scan_mode <0~2> */
enum cmd_status btcli_set_scanmode(char *cmd)
{
    int argc;
    char *argv[1];
    int mode;

    argc = cmd_parse_argv(cmd, argv, 1);
    if (argc != 1) {
        CMD_ERR("invalid param number %d\n", argc);
        return CMD_STATUS_INVALID_ARG;
    }
    mode = cmd_atoi(argv[0]);

    btmg_adapter_set_scanmode(mode);

    return CMD_STATUS_OK;
}

/* btcli scan <on/off> */
enum cmd_status btcli_scan(char *cmd)
{
    int argc;
    char *argv[1];

    argc = cmd_parse_argv(cmd, argv, cmd_nitems(argv));
    if (argc != 1) {
        CMD_ERR("invalid param number %d\n", argc);
        return CMD_STATUS_INVALID_ARG;
    }

    if (!strcmp(argv[0], "on")) {
        if (discovered_devices != NULL) {
            btmg_dev_list_free(discovered_devices);
            discovered_devices = NULL;
        }
        discovered_devices = btmg_dev_list_new();
        if (discovered_devices == NULL)
            return CMD_STATUS_FAIL;
        btmg_adapter_start_scan();
    } else if (!strcmp(argv[0], "off")) {
        btmg_adapter_stop_scan();
    }

    return CMD_STATUS_OK;
}

/* btcli io_cap <0~4> */
enum cmd_status btcli_set_io_cap(char *cmd)
{
    int argc;
    char *argv[1];
    int io_cap;

    argc = cmd_parse_argv(cmd, argv, 1);
    if (argc != 1) {
        CMD_ERR("invalid param number %d\n", argc);
        return CMD_STATUS_INVALID_ARG;
    }
    io_cap = cmd_atoi(argv[0]);

    btmg_adapter_set_io_capability(io_cap);

    return CMD_STATUS_OK;
}

/* btcli get_dev_name */
enum cmd_status btcli_get_device_name(char *cmd)
{
    int argc;
    char *argv[1];

    argc = cmd_parse_argv(cmd, argv, 1);
    if (argc != 1) {
        CMD_ERR("invalid param number %d\n", argc);
        return CMD_STATUS_INVALID_ARG;
    }

    btmg_device_get_name(argv[0]);

    return CMD_STATUS_OK;
}

/* btcli get_name */
enum cmd_status btcli_get_adapter_name(char *cmd)
{
    btmg_adapter_get_name();

    return CMD_STATUS_OK;
}

/* btcli set_name <name> */
enum cmd_status btcli_set_adapter_name(char *cmd)
{
    int argc;
    char *argv[1];

    argc = cmd_parse_argv(cmd, argv, 1);
    if (argc != 1) {
        CMD_ERR("invalid param number %d\n", argc);
        return CMD_STATUS_INVALID_ARG;
    }

    btmg_adapter_set_name(argv[0]);

    return CMD_STATUS_OK;
}

/* btcli get_mac */
enum cmd_status btcli_get_adapter_mac(char *cmd)
{
    char mac[18] = { 0 };

    btmg_adapter_get_address(mac);
    CMD_DBG("adapter mac is:%s", mac);

    return CMD_STATUS_OK;
}

static bool btcli_init_state = false;
static int profile = 0;

/* btcli init or btcli init -p a2dp-source -d 4 */
enum cmd_status btcli_init(char *cmd)
{
    int i = 0;
    int argc;
    char *argv[10];

    btmg_log_level_t debug;

    argc = cmd_parse_argv(cmd, argv, cmd_nitems(argv));

    for (i = 0; i < argc; i++) {
        if (strcmp(argv[i], "-h") == 0) {
            CMD_DBG("Usage:\n"
                   "  [OPTION]...\n"
                   "\nOptions:\n"
                   "  -h, --help\t\tprint this help and exit\n"
                   "  -d, --debug\t open debug :-d [0~5]\n"
                   "  -p, --profile=NAME\tenable bluetooth profile\n"
                   "  [supported profile name]:\n"
                   "  - a2dp-source\tAdvanced Audio Source\n"
                   "  - a2dp-sink\tAdvanced Audio Sink\n"
                   "  - hfp-hf\tHands-Free\n"
                   "  - spp-server\tSerial Port Profile-Server role\n"
                   "  - spp-client\tSerial Port Profile-Client role\n"
                   "  - gatt-server\tble gatt server\n"
                   "  - gatt-client\tble gatt client\n");
            return CMD_STATUS_OK;
        }

        if (strcmp(argv[i], "-p") == 0) {
            if (i + 1 < argc) {
                int c;
                struct {
                    const char *name;
                    int value;
                } map[] = {
                    { "a2dp-sink",      BTMG_A2DP_SINK },
                    { "a2dp-source",    BTMG_A2DP_SOURCE },
                    { "hfp-hf",         BTMG_HFP_HF},
                    { "hfp-ag",         BTMG_HFP_AG},
                    { "spp-server",     BTMG_SPP_SERVER },
                    { "spp-client",     BTMG_SPP_CLIENT },
                    { "gatt-server",    BTMG_GATT_SERVER },
                    { "gatt-client",    BTMG_GATT_CLIENT},
                };

                for (c = 0; c < ARRAY_SIZE(map); c++) {
                    if (strcasecmp(argv[i+1], map[c].name) == 0) {
                        profile |= map[c].value;
                        break;
                    }
                }
                if (c == ARRAY_SIZE(map)) {
                    CMD_ERR("Invalid BT profile name: %s\n", argv[i+1]);
                }
            }else {
                CMD_ERR("invalid parameter, please specify a profile\n");
                break;
            }
        }

        if (strcmp(argv[i], "-d") == 0) {
            if (i + 1 < argc) {
                debug = (btmg_log_level_t)atoi(argv[i+1]);
                CMD_DBG("debug loglevel :%d\n", (int)debug);
                btmg_set_loglevel(debug);
            } else {
                CMD_ERR("invalid parameter, please specify a level\n");
                break;
            }
        }
    }
    if (btcli_init_state) {
        CMD_WRN("BT is already INIT!\n");
        return CMD_STATUS_OK;
    }

    if (profile == 0) {
        CMD_DBG("use default profile\n");
        profile |= BTMG_A2DP_SINK;
    }

    btmg_cbs.btmg_adapter_cb.state_cb = btcli_adapter_status_cb;
    btmg_cbs.btmg_adapter_cb.scan_status_cb = btcli_scan_status_cb;
    btmg_cbs.btmg_device_cb.device_add_cb = btcli_scan_dev_add_cb;
    btmg_cbs.btmg_adapter_cb.bonded_device_cb = btcli_bonded_device_cb;
    btmg_cbs.btmg_adapter_cb.get_name_cb = btcli_adapter_name_cb;
    btmg_cbs.btmg_device_cb.pindcoe_request_cb = btcli_device_pindcoe_request_cb;
    btmg_cbs.btmg_device_cb.passkey_request_cb = btcli_device_passkey_request_cb;
    btmg_cbs.btmg_device_cb.passkey_confirm_cb = btcli_device_passkey_confirm_cb;
    btmg_cbs.btmg_device_cb.pairing_confirm_cb = btcli_device_pairing_confirm_cb;
#ifdef CONFIG_BT_A2DP_ENABLE
    if (profile & BTMG_A2DP_SINK) {
        btmg_cbs.btmg_a2dp_sink_cb.conn_state_cb = btcli_a2dp_sink_connection_state_cb;
        btmg_cbs.btmg_a2dp_sink_cb.audio_state_cb = btcli_a2dp_sink_audio_state_cb;
    }
    if (profile & BTMG_A2DP_SOURCE) {
        btmg_cbs.btmg_a2dp_source_cb.conn_state_cb = btcli_a2dp_source_connection_state_cb;
        btmg_cbs.btmg_a2dp_source_cb.audio_state_cb = btcli_a2dp_source_audio_state_cb;
    }
    btmg_cbs.btmg_avrcp_cb.avrcp_ct_play_state_cb = btcli_avrcp_ct_play_state_cb;
    btmg_cbs.btmg_avrcp_cb.avrcp_ct_play_position_cb = btcli_avrcp_ct_play_position_cb;
    btmg_cbs.btmg_avrcp_cb.avrcp_ct_track_changed_cb = btcli_avrcp_ct_track_changed_cb;
    btmg_cbs.btmg_avrcp_cb.avrcp_tg_play_state_cb = btcli_avrcp_tg_play_state_cb;
    btmg_cbs.btmg_avrcp_cb.avrcp_audio_volume_cb = btcli_avrcp_audio_volume_cb;
#endif
#ifdef CONFIG_BT_SPP_ENABLED
    if (profile & BTMG_SPP_CLIENT) {
        btmg_cbs.btmg_sppc_cb.conn_state_cb = btcli_sppc_conn_status_cb;
        btmg_cbs.btmg_sppc_cb.recvdata_cb = btcli_sppc_recvdata_cb;
    }
    if (profile & BTMG_SPP_SERVER) {
        btmg_cbs.btmg_spps_cb.conn_state_cb = btcli_spps_conn_status_cb;
        btmg_cbs.btmg_spps_cb.recvdata_cb = btcli_spps_recvdata_cb;
    }
#endif
#ifdef CONFIG_BT_HFP_CLIENT_ENABLE
    if (profile & BTMG_HFP_HF) {
        btmg_cbs.btmg_hfp_hf_cb.conn_state_cb = btcli_hfp_hf_connection_state_cb;
        btmg_cbs.btmg_hfp_hf_cb.event_cb = btcli_hfp_hf_event_cb;
    }
#endif
#ifdef CONFIG_BT_HFP_AG_ENABLE
    if (profile & BTMG_HFP_AG) {
        btmg_cbs.btmg_hfp_ag_cb.conn_state_cb = btcli_hfp_ag_connection_state_cb;
        btmg_cbs.btmg_hfp_ag_cb.event_cb = btcli_hfp_ag_event_cb;
        btmg_cbs.btmg_hfp_ag_cb.audio_incoming_cb = btcli_hfp_ag_audio_incoming_cb;
        btmg_cbs.btmg_hfp_ag_cb.audio_outgoing_cb = btcli_hfp_ag_audio_outgoing_cb;
    }
#endif
    if (profile & BTMG_GATT_SERVER) {
        btmg_cbs.btmg_gatts_cb.conn_cb = btcli_ble_connection_cb;
        btmg_cbs.btmg_gatts_cb.get_db_cb = btcli_gatts_get_db_cb;
        btmg_cbs.btmg_gatts_cb.char_read_req_cb = btcli_gatts_char_read_req_cb;
        btmg_cbs.btmg_gatts_cb.char_write_req_cb = btcli_gatts_char_write_req_cb;
        btmg_cbs.btmg_gatts_cb.ccc_cfg_cb = btcli_gatts_ccc_cfg_cb;
    }
    if (profile & BTMG_GATT_CLIENT) {
        btmg_cbs.btmg_gattc_cb.le_scan_cb = btcli_ble_scan_cb;
        btmg_cbs.btmg_gattc_cb.conn_cb = btcli_ble_connection_cb;
        btmg_cbs.btmg_gattc_cb.dis_att_cb = btcli_gattc_dis_att_cb;
        btmg_cbs.btmg_gattc_cb.read_cb = btcli_gattc_read_cb;
        btmg_cbs.btmg_gattc_cb.write_cb = btcli_gattc_write_cb;
        btmg_cbs.btmg_gattc_cb.notify_indicate_cb = btcli_gattc_notify_indicate_cb;
    }

    btmg_core_init();
    btmg_register_callback(&btmg_cbs);
    btmg_set_profile(profile);
    btmg_adapter_enable(true);
    btcli_init_state = true;

    if (profile & BTMG_GATT_SERVER) {
        ble_gatt_register_service();
        ble_advertise_on();
    }

    return CMD_STATUS_OK;
}

enum cmd_status btcli_deinit(char *cmd)
{
    if (profile & BTMG_GATT_SERVER) {
        ble_gatt_unregister_service();
        btmg_le_enable_adv(false);
        btmg_gatt_attr_destory(db);
        db  = NULL;
    }
    btmg_adapter_enable(false);
    btmg_core_deinit();
    btmg_unregister_callback();
    btcli_init_state = false;

    if (discovered_devices != NULL) {
        btmg_dev_list_free(discovered_devices);
        discovered_devices = NULL;
    }

    return CMD_STATUS_OK;
}

tatic enum cmd_status btcli_sink_help(char *cmd);

void btcli_a2dp_sink_connection_state_cb(const char *bd_addr,
                                         btmg_a2dp_sink_connection_state_t state)
{
    if (state == BTMG_A2DP_SINK_DISCONNECTED) {
        CMD_DBG("A2DP sink disconnected with device: %s\n", bd_addr);
        btmg_adapter_set_scanmode(BTMG_SCAN_MODE_CONNECTABLE_DISCOVERABLE);
    } else if (state == BTMG_A2DP_SINK_CONNECTING) {
        CMD_DBG("A2DP sink connecting with device: %s\n", bd_addr);
    } else if (state == BTMG_A2DP_SINK_CONNECTED) {
        CMD_DBG("A2DP sink connected with device: %s\n", bd_addr);
    } else if (state == BTMG_A2DP_SINK_DISCONNECTING) {
        CMD_DBG("A2DP sink disconnecting with device: %s\n", bd_addr);
    }
}

void btcli_a2dp_sink_audio_state_cb(const char *bd_addr, btmg_a2dp_sink_audio_state_t state)
{
    if (state == BTMG_A2DP_SINK_AUDIO_SUSPENDED) {
        CMD_DBG("A2DP sink audio suspended with device: %s\n", bd_addr);
    } else if (state == BTMG_A2DP_SINK_AUDIO_STOPPED) {
        CMD_DBG("A2DP sink audio stopped with device: %s\n", bd_addr);
    } else if (state == BTMG_A2DP_SINK_AUDIO_STARTED) {
        CMD_DBG("A2DP sink audio started with device: %s\n", bd_addr);
    }
}

/* btcli a2dp_snk connect <device mac> */
enum cmd_status btcli_sink_connect(char *cmd)
{
    int argc;
    char *argv[1];

    argc = cmd_parse_argv(cmd, argv, 1);
    if (argc < 1) {
        CMD_ERR("invalid param number %d\n", argc);
        return CMD_STATUS_INVALID_ARG;
    }

    btmg_a2dp_sink_connect(argv[0]);

    return CMD_STATUS_OK;
}

/* btcli a2dp_snk disconnect <device mac> */
enum cmd_status btcli_sink_disconnect(char *cmd)
{
    int argc;
    char *argv[1];

    argc = cmd_parse_argv(cmd, argv, 1);
    if (argc < 1) {
        CMD_ERR("invalid param number %d\n", argc);
        return CMD_STATUS_INVALID_ARG;
    }

    btmg_a2dp_sink_disconnect(argv[0]);

    return CMD_STATUS_OK;
}

static const struct cmd_data a2dp_sink_cmds[] = {
    { "connect",    btcli_sink_connect,    CMD_DESC("<device mac>")},
    { "disconnect", btcli_sink_disconnect, CMD_DESC("<device mac>")},
    { "help",       btcli_sink_help,       CMD_DESC(CMD_HELP_DESC) },
};

/* btcli a2dp_snk help */
static enum cmd_status btcli_sink_help(char *cmd)
{
	return cmd_help_exec(a2dp_sink_cmds, cmd_nitems(a2dp_sink_cmds), 10);
}

enum cmd_status btcli_a2dp_sink(char *cmd)
{
    return cmd_exec(cmd, a2dp_sink_cmds, cmd_nitems(a2dp_sink_cmds));
}
```

##### 初始化

1. 总回调结构体是 btmg_callback_t，先设置 a2dp sink 相关回调函数；
2. 调用 btmg_core_init 初始化 btmanager;
3. 调用 btmg_register_callback 注册步骤 1 设置好的回调函数；
4. 调用 btmg_set_profile(BTMG_A2DP_SINK) 使能蓝牙 Profile；
5. 调用 btmg_adapter_enable(true) 使能蓝牙
6. 蓝牙使能成功后触发 state_cb，参考 btcli_adapter_status_cb；
7. 在 state_cb 中调用 btmg_adapter_set_name，设置蓝牙名称；
8. 在 state_cb 中调用 btmg_adapter_set_io_capability，设置 io_capability 能力；
9. 在 state_cb 中调用 btmg_adapter_set_scanmode，设置发现模式；

##### 音乐播放控制

1. 蓝牙初始化完成后，手机可以搜索和连接，连接成功的回调是 conn_state_cb，参考btcli_a2dp_sink_connection_state_cb；
2. 播放状态，歌曲进度，歌曲信息通过 btmg_avrcp_cb 的 avrcp_play_state_cb/avrcp_play_position_cb/avrcp_track_changed_cb 回调获得；
3. 获取/设置音量，API 调用参考 btcli_get_absolute_volume/btcli_set_absolute_volume;
4. 主动断开连接调用 btmg_a2dp_sink_disconnect 实现；
5. bt_manager 默认没有集成蓝牙回连的功能，用户可以基于 btmg_a2dp_sink_connect 接口进行功能实现；
6. 音频数据的处理默认在 bt_manager 内部处理播放，用户如果需要直接获取音频数据做音效等处理，打开 CONFIG_A2DP_SINK_AUDIO_CB 宏后，应用可以通过 stream_cb 拿到数据；

### AVRCP 开发

AVRCP 分为 AVRCP CT 和 AVRCP TG 两个角色，一个设备可以同时拥有该两种角色。

以蓝牙音箱为例:

- 手机连接音箱播放音乐，音箱端可以通过 AVRCP 控制手机上下曲控制等，此时手机作为被控制方，是 AVRCP TG，音箱是控制方，是 AVRCP CT；
- 手机和音箱都支持绝对音量，手机端可以通过 AVRCP 设置音箱音量，并通过 RegisterNotification 注册音量变化的通知事件，音箱音量变化后，手机会收到音箱的 RegisterNotification response 通知。这种情况手机作为 AVRCP CT，音箱作为 AVRCP TG；

####  AVRCP CT API

| API 接口                          | 说明                         |
| --------------------------------- | ---------------------------- |
| btmg_avrc_ct_send_passthrough_cmd | 发送命令控制 AVRCP TG        |
| btmg_avrc_set_absolute_volume     | 发送命令设置 AVRCP TG 的音量 |
| btmg_avrc_get_absolute_volume     | 发送命令获取音量             |

#### AVRCP TG API

| API 接口                      | 说明                                                         |
| ----------------------------- | ------------------------------------------------------------ |
| btmg_avrc_set_absolute_volume | 此接口同样适用 AVRCP TG，内部设置好本地音量变化后，也会通知 AVRCP CT |
| btmg_avrc_get_absolute_volume | 发送命令获取音量                                             |

AVRCP TG 目前只有 1 个 API，其重点是回调函数，有如下 callback 使用：

```c
typedef struct {
    bt_avrcp_ct_play_state_cb avrcp_ct_play_state_cb; //ct播放状态
    bt_avrcp_ct_track_changed_cb avrcp_ct_track_changed_cb; //歌曲信息&歌词信息
    bt_avrcp_ct_play_position_cb avrcp_ct_play_position_cb; //播放进度条信息
    bt_avrcp_tg_play_state_cb avrcp_tg_play_state_cb; //tg播放状态
    bt_avrcp_audio_volume_cb avrcp_audio_volume_cb; //音量大小
} btmg_avrcp_callback_t;
```

### A2DP Source 开发

A2DP Source 设备一般支持音乐播放功能，例如扫读笔、学习机等产品。此类产品有连接蓝牙耳机/蓝牙音箱等 A2DP Sink 设备需求。

#### A2DP Source API

| API 接口                         | 说明                                                         |
| -------------------------------- | ------------------------------------------------------------ |
| btmg_a2dp_source_connect         | 连接指定 A2DP Sink 设备                                      |
| btmg_a2dp_source_disconnect      | 断开与指定设备的连接                                         |
| btmg_a2dp_source_set_audio_param | 设置需要播放的音频流的参数：通道数与采样率，以便 btmanager 对音频进行处理 |
| btmg_a2dp_source_send_data       | 应用层发送音频流数据给 btmanager                             |
| btmg_a2dp_source_play_start      | 开始处理音频数据，建议在btmg_a2dp_source_send_data 之前运行  |
| btmg_a2dp_source_play_stop       | 停止处理音频数据，参数为 true 时表示立即停止，丢弃缓存中的数据，反之保留 |
| btmg_a2dp_source_is_ready        | 判断是否已经初始化就绪                                       |

#### A2DP source API 调用流程

```c
#include "cmd_util.h"
#include <stdio.h>
#include <stdlib.h>
#include <getopt.h>

#include "btmg_dev_list.h"
#include "bt_manager.h"

btmg_callback_t btmg_cbs;
dev_list_t *discovered_devices = NULL;

#ifdef CONFIG_BT_A2DP_ENABLE
extern void btcli_a2dp_source_connection_state_cb(const char *bd_addr,
                                                  btmg_a2dp_source_connection_state_t state);
extern void btcli_a2dp_source_audio_state_cb(const char *bd_addr,
                                             btmg_a2dp_source_audio_state_t state);
extern void btcli_a2dp_sink_connection_state_cb(const char *bd_addr,
                                                btmg_a2dp_sink_connection_state_t state);
extern void btcli_a2dp_sink_audio_state_cb(const char *bd_addr, btmg_a2dp_sink_audio_state_t state);
extern void btcli_avrcp_ct_play_state_cb(const char *bd_addr, btmg_avrcp_play_state_t state);
extern void btcli_avrcp_ct_track_changed_cb(const char *bd_addr, btmg_track_info_t *track_info);
extern void btcli_avrcp_ct_play_position_cb(const char *bd_addr, int song_len, int song_pos);
extern void btcli_avrcp_audio_volume_cb(const char *bd_addr, unsigned int volume);
extern void btcli_avrcp_tg_play_state_cb(const char *bd_addr, btmg_avrcp_play_state_t state);
#endif
#ifdef CONFIG_BT_SPP_ENABLED
extern void btcli_sppc_conn_status_cb(const char *bd_addr, btmg_spp_connection_state_t status);
extern void btcli_sppc_recvdata_cb(const char *bd_addr, char *data, int data_len);
extern void btcli_spps_conn_status_cb(const char *bd_addr, btmg_spp_connection_state_t status);
extern void btcli_spps_recvdata_cb(const char *bd_addr, char *data, int data_len);
#endif
#ifdef CONFIG_BT_HFP_CLIENT_ENABLE
extern void btcli_hfp_hf_event_cb(btmg_hfp_hf_event_t event, void *data);
extern void btcli_hfp_hf_connection_state_cb(const char *bd_addr,
                                             btmg_hfp_hf_connection_state_t state);
#endif
#ifdef CONFIG_BT_HFP_AG_ENABLE
extern void btcli_hfp_ag_event_cb(btmg_hfp_ag_event_t event, void *data);
extern void btcli_hfp_ag_connection_state_cb(const char *bd_addr,
                                             btmg_hfp_ag_connection_state_t state);
extern void btcli_hfp_ag_audio_incoming_cb(const uint8_t *buf, uint32_t sz);
extern uint32_t btcli_hfp_ag_audio_outgoing_cb(uint8_t *p_buf, uint32_t sz);
#endif
extern void btcli_ble_scan_cb(le_scan_cb_para_t *data);
extern void btcli_ble_connection_cb(le_connection_para_t *data);
extern void btcli_gattc_dis_att_cb(gattc_dis_cb_para_t *data);
extern void btcli_gattc_notify_indicate_cb(gattc_notify_indicate_cb_para_t *data);
extern void btcli_gatts_get_db_cb(gatts_get_db_t *data);
extern void btcli_gatts_char_read_req_cb(gatts_char_read_req_t *data);
extern void btcli_gatts_char_write_req_cb(gatts_char_write_req_t *data);
extern void btcli_gatts_ccc_cfg_cb(gatts_ccc_cfg_t *data);
extern void btcli_gattc_read_cb(gattc_read_cb_para_t *data);
extern void btcli_gattc_write_cb(gattc_write_cb_para_t *data);

#define AUTH_IDLE            0
#define AUTH_PIN_CODE        1
#define AUTH_ENTER_PASSKEY   2
#define AUTH_PASSKEY_CONFIRM 3
#define AUTH_PAIRING_CONFIRM 4

typedef struct {
    char addr[18];
    uint32_t passkey;
    uint8_t flag; //0:none 1:pin code 2:enter passkey 3:passkey_confirm 4: pairing confirm
} pair_req_t;

static btmg_gatt_db_t *db;
static int ble_gatt_register_service(void)
{
    if (db != NULL) {
        CMD_ERR("gatt already registered\n");
        return 0;
    }

    btmg_uuid_t uuid;
    btmg_gatt_properties_t prop;
    btmg_gatt_permission_t perm = BTMG_GATT_PERM_READ | BTMG_GATT_PERM_WRITE;

    /* service1 start, uuid=0xABCD */
    db = btmg_gatt_attr_create(12); //CHAR+2 other+1
    uuid.type = BTMG_UUID_16;
    uuid.value.u16 = 0xABCD;
    btmg_gatt_attr_primary_service(db, uuid); // +1

    uuid.value.u16 = 0xfff2;
    prop = BTMG_GATT_CHRC_READ | BTMG_GATT_CHRC_WRITE;
    btmg_gatt_attr_characteristic(db, uuid, prop, perm); // +2

    uuid.value.u16 = 0xfff3;
    prop = BTMG_GATT_CHRC_READ | BTMG_GATT_CHRC_WRITE | BTMG_GATT_CHRC_NOTIFY | BTMG_GATT_CHRC_INDICATE;
    btmg_gatt_attr_characteristic(db, uuid, prop, perm); // +2
    btmg_gatt_attr_ccc(db, perm);                        // +1
    /* service1 end*/
    /* service2 start, uuid=0x7788 */
    uuid.type = BTMG_UUID_16;
    uuid.value.u16 = 0x7788;
    btmg_gatt_attr_primary_service(db, uuid); // +1

    uuid.value.u16 = 0x1122;
    prop = BTMG_GATT_CHRC_READ;
    btmg_gatt_attr_characteristic(db, uuid, prop, perm); // +2

    uuid.value.u16 = 0x3344;
    prop = BTMG_GATT_CHRC_READ | BTMG_GATT_CHRC_WRITE | BTMG_GATT_CHRC_NOTIFY;
    btmg_gatt_attr_characteristic(db, uuid, prop, perm); // +2
    btmg_gatt_attr_ccc(db, perm);                        // +1
    /* service2 end*/

    btmg_gatt_register_service(db);

    return CMD_STATUS_OK;
}

static int ble_gatt_unregister_service(void)
{
    if (db == NULL) {
        CMD_ERR("gatt already unregistered\n");
        return 0;
    }

    btmg_gatt_unregister_service(db);

    return CMD_STATUS_OK;
}

static int ble_set_adv_data(void)
{
    int index = 0;
    uint16_t uuid = 0x1234;
    char ble_name[] = "aw-btcli-ble";

    btmg_adv_scan_rsp_data_t adv_data;

    adv_data.data[index] = 0x02; /* flag len */
    adv_data.data[index + 1] = 0x01; /* type for flag */
    adv_data.data[index + 2] = 0x1A; //0x05

    index += adv_data.data[index] + 1;

    adv_data.data[index] = strlen(ble_name) + 1; /* name len */
    adv_data.data[index + 1] = 0x09; /* type for local name */
    int name_len;
    name_len = strlen(ble_name);
    strcpy(&(adv_data.data[index + 2]), ble_name);
    index += adv_data.data[index] + 1;

    adv_data.data[index] = 0x03; /* uuid len */
    adv_data.data[index + 1] = 0x03; /* type for complete list of 16-bit uuid */
    adv_data.data[index + 2] = (char)(uuid & 0xFF);
    adv_data.data[index + 3] = (char)((uuid >> 8) & 0xFF);
    index += adv_data.data[index] + 1;

    adv_data.data_len = index;

    return btmg_le_set_adv_scan_rsp_data(&adv_data, NULL);
}

static int ble_advertise_on(void)
{
    btmg_le_adv_param_t adv_param;

    adv_param.interval_min = 0x0020;
    adv_param.interval_max = 0x01E0;
    adv_param.adv_type = BTMG_LE_ADV_IND;

    btmg_le_set_adv_param(&adv_param);
    ble_set_adv_data();
    return btmg_le_enable_adv(true);
}

static pair_req_t pair_req = { { 0 }, 0, 0 };

void btcli_scan_status_cb(btmg_scan_state_t status)
{
    if (status == BTMG_SCAN_STARTED) {
        CMD_DBG("start scanning\n");
    } else if (status == BTMG_SCAN_STOPPED) {
        CMD_DBG("stop scanning\n");
    }
}

void btcli_scan_dev_add_cb(btmg_device_t *device)
{
    dev_node_t *dev_node = NULL;

    CMD_DBG("name:[%s]\t\taddress:[%s]\t\tclass:[%d]\t\trssi:[%d]\n", device->name, device->address,
            device->cod, device->rssi);

    dev_node = btmg_dev_list_find_device(discovered_devices, device->address);
    if (dev_node != NULL) {
        return;
    }

    btmg_dev_list_add_device(discovered_devices, device->name, device->address, 0);
}

void btcli_adapter_name_cb(char *name)
{
    CMD_DBG("btcli get adapter name:%s\n", name);
}

void btcli_device_name_cb(char *name)
{
    CMD_DBG("btcli get remote device name:%s\n", name);
}

void btcli_bonded_device_cb(btmg_bond_state_t state, const char *bd_addr)
{
    dev_node_t *dev_discovered_node = NULL;

    CMD_DBG("bonded device state:%d, addr:%s\n", state, bd_addr);

    dev_discovered_node = btmg_dev_list_find_device(discovered_devices, bd_addr);
    if (state == BTMG_BOND_STATE_BONDED) {
        if (dev_discovered_node != NULL) {
            btmg_dev_list_remove_device(discovered_devices, bd_addr);
        }
        CMD_DBG("Pairing state for %s is BONDED \n", bd_addr);
    } else if (state == BTMG_BOND_STATE_BOND_FAILED) {
        CMD_DBG("Pairing state for %s is BOND_FAILED \n", bd_addr);
    }
}

void btcli_device_pindcoe_request_cb(const char *addr)
{
    CMD_DBG("dev:%s,pindcoe request, Please enter pincode\n", addr);
    memcpy(pair_req.addr, addr, sizeof(pair_req.addr));
    pair_req.flag = AUTH_PIN_CODE;
}

void btcli_device_passkey_request_cb(const char *addr)
{
    CMD_DBG("dev:%s,passkey_request, Please enter passkey!\n", addr);
    memcpy(pair_req.addr, addr, sizeof(pair_req.addr));
    pair_req.flag = AUTH_ENTER_PASSKEY;
}

void btcli_device_passkey_confirm_cb(const char *addr, uint32_t passkey)
{
    CMD_DBG("please confirm the passkey(%d) sent by the %s device!\n", passkey, addr);
    memcpy(pair_req.addr, addr, sizeof(pair_req.addr));
    pair_req.passkey = passkey;
    pair_req.flag = AUTH_PASSKEY_CONFIRM;
}

void btcli_device_pairing_confirm_cb(const char *addr, uint32_t passkey)
{
    CMD_DBG("dev:%s,pairing_confirm,please compare the passkey numeric value: %d\n", addr, passkey);
    memcpy(pair_req.addr, addr, sizeof(pair_req.addr));
    pair_req.passkey = passkey;
    pair_req.flag = AUTH_PAIRING_CONFIRM;
}

void btcli_adapter_status_cb(btmg_adapter_state_t status)
{
    char bt_addr[18] = { 0 };
    char bt_name_buf[64] = { 0 };
    char bt_name[64] = { 0 };

    if (status == BTMG_ADAPTER_OFF) {
        CMD_DBG("BT is off\n");
    } else if (status == BTMG_ADAPTER_ON) {
        CMD_DBG("BT is on\n");
        btmg_adapter_get_address(bt_addr);
        if (bt_addr[0] != '\0') {
            snprintf(bt_name_buf, 12, "aw-btcli-%s-", (char *)(bt_addr + 12));
            sprintf(bt_name, "%s-%s", bt_name_buf, (char *)(bt_addr + 15));
            btmg_adapter_set_name(bt_name);
        } else {
            btmg_adapter_set_name("aw-btcli");
        }
        btmg_adapter_set_io_capability(BTMG_IO_CAP_NOINPUTNOOUTPUT);
        btmg_adapter_set_scanmode(BTMG_SCAN_MODE_CONNECTABLE_DISCOVERABLE);
    } else if (status == BTMG_ADAPTER_TURNING_ON) {
        CMD_DBG("BT is turnning on\n");
    } else if (status == BTMG_ADAPTER_TURNING_OFF) {
        CMD_DBG("BT is turnning off\n");
    }
}

/* btcli pincode <0000~9999> */
enum cmd_status btcli_pincode(char *cmd)
{
    if (pair_req.flag != AUTH_PIN_CODE) {
        CMD_ERR("No need to enter pin code now\n");
        return CMD_STATUS_FAIL;
    }

    int argc;
    char *argv[1];

    argc = cmd_parse_argv(cmd, argv, 1);
    if (argc < 1) {
        CMD_ERR("invalid param number %d\n", argv[0]);
        return CMD_STATUS_INVALID_ARG;
    }

    btmg_device_pincode_reply(argv[0]);
    pair_req.flag = AUTH_IDLE;

    return CMD_STATUS_OK;
}

#if (BT_SSP_INCLUDED == TRUE)
/* btcli passkey <000000~999999> */
enum cmd_status btcli_passkey(char *cmd)
{
    if (pair_req.flag != AUTH_ENTER_PASSKEY) {
        CMD_ERR("No need to enter passkey now\n");
        return CMD_STATUS_FAIL;
    }

    uint32_t passkey = 0;
    int argc;
    char *argv[1];

    argc = cmd_parse_argv(cmd, argv, 1);
    if (argc < 1) {
        CMD_ERR("invalid param number %d\n", argc);
        return CMD_STATUS_INVALID_ARG;
    }
    passkey = atoi(argv[0]);
    if (passkey > 999999) {
        CMD_ERR("Passkey should be between 0-999999");
        return CMD_STATUS_INVALID_ARG;
    }

    btmg_device_passkey_reply(passkey);
    pair_req.flag = AUTH_IDLE;

    return CMD_STATUS_OK;
}

/* btcli passkey_confirm */
enum cmd_status btcli_passkey_confirm(char *cmd)
{
    if (pair_req.flag != AUTH_PASSKEY_CONFIRM) {
        CMD_ERR("No need to enter this command now\n");
        return CMD_STATUS_FAIL;
    }

    btmg_device_passkey_confirm(pair_req.passkey);
    pair_req.flag = AUTH_IDLE;

    return CMD_STATUS_OK;
}

/* btcli pairing_confirm */
enum cmd_status btcli_pairing_confirm(char *cmd)
{
    if (pair_req.flag != AUTH_PAIRING_CONFIRM) {
        CMD_ERR("No need to need to enter this command now\n");
        return CMD_STATUS_FAIL;
    }

    btmg_device_pairing_confirm();
    pair_req.flag = AUTH_IDLE;

    return CMD_STATUS_OK;
}
#endif

/* btcli scan_list */
enum cmd_status btcli_scan_list(char *cmd)
{
    dev_node_t *dev_node = NULL;

    if (discovered_devices == NULL) {
        CMD_WRN("scan list is empty\n");
        return CMD_STATUS_OK;
    }

    dev_node = discovered_devices->head;
    while (dev_node != NULL) {
        CMD_DBG("addr: %s, name: %s\n", dev_node->dev_addr, dev_node->dev_name);
        dev_node = dev_node->next;
    }

    return CMD_STATUS_OK;
}

/* btcli paired_list */
enum cmd_status btcli_paired_list(char *cmd)
{
    int device_num = -1;
    btmg_err ret;

    btmg_get_paired_device_num(&device_num);
    if (device_num <= 0) {
        CMD_DBG("no device is bonded!\n");
        return CMD_STATUS_OK;
    }

    btmg_paired_device_t paired_list[device_num];

    if ((ret = btmg_get_paired_devices(device_num, paired_list)) != BT_OK) {
        CMD_ERR("return failed: %d\n", ret);
        return CMD_STATUS_FAIL;
    }

    CMD_DBG("get paired device_list:\n");
    for (int i = 0; i < device_num; i++) {
        CMD_DBG("device[%s]\n", paired_list[i].address);
    }

    return CMD_STATUS_OK;
}

/* btcli scan_mode <0~2> */
enum cmd_status btcli_set_scanmode(char *cmd)
{
    int argc;
    char *argv[1];
    int mode;

    argc = cmd_parse_argv(cmd, argv, 1);
    if (argc != 1) {
        CMD_ERR("invalid param number %d\n", argc);
        return CMD_STATUS_INVALID_ARG;
    }
    mode = cmd_atoi(argv[0]);

    btmg_adapter_set_scanmode(mode);

    return CMD_STATUS_OK;
}

/* btcli scan <on/off> */
enum cmd_status btcli_scan(char *cmd)
{
    int argc;
    char *argv[1];

    argc = cmd_parse_argv(cmd, argv, cmd_nitems(argv));
    if (argc != 1) {
        CMD_ERR("invalid param number %d\n", argc);
        return CMD_STATUS_INVALID_ARG;
    }

    if (!strcmp(argv[0], "on")) {
        if (discovered_devices != NULL) {
            btmg_dev_list_free(discovered_devices);
            discovered_devices = NULL;
        }
        discovered_devices = btmg_dev_list_new();
        if (discovered_devices == NULL)
            return CMD_STATUS_FAIL;
        btmg_adapter_start_scan();
    } else if (!strcmp(argv[0], "off")) {
        btmg_adapter_stop_scan();
    }

    return CMD_STATUS_OK;
}

/* btcli io_cap <0~4> */
enum cmd_status btcli_set_io_cap(char *cmd)
{
    int argc;
    char *argv[1];
    int io_cap;

    argc = cmd_parse_argv(cmd, argv, 1);
    if (argc != 1) {
        CMD_ERR("invalid param number %d\n", argc);
        return CMD_STATUS_INVALID_ARG;
    }
    io_cap = cmd_atoi(argv[0]);

    btmg_adapter_set_io_capability(io_cap);

    return CMD_STATUS_OK;
}

/* btcli get_dev_name */
enum cmd_status btcli_get_device_name(char *cmd)
{
    int argc;
    char *argv[1];

    argc = cmd_parse_argv(cmd, argv, 1);
    if (argc != 1) {
        CMD_ERR("invalid param number %d\n", argc);
        return CMD_STATUS_INVALID_ARG;
    }

    btmg_device_get_name(argv[0]);

    return CMD_STATUS_OK;
}

/* btcli get_name */
enum cmd_status btcli_get_adapter_name(char *cmd)
{
    btmg_adapter_get_name();

    return CMD_STATUS_OK;
}

/* btcli set_name <name> */
enum cmd_status btcli_set_adapter_name(char *cmd)
{
    int argc;
    char *argv[1];

    argc = cmd_parse_argv(cmd, argv, 1);
    if (argc != 1) {
        CMD_ERR("invalid param number %d\n", argc);
        return CMD_STATUS_INVALID_ARG;
    }

    btmg_adapter_set_name(argv[0]);

    return CMD_STATUS_OK;
}

/* btcli get_mac */
enum cmd_status btcli_get_adapter_mac(char *cmd)
{
    char mac[18] = { 0 };

    btmg_adapter_get_address(mac);
    CMD_DBG("adapter mac is:%s", mac);

    return CMD_STATUS_OK;
}

static bool btcli_init_state = false;
static int profile = 0;

/* btcli init or btcli init -p a2dp-source -d 4 */
enum cmd_status btcli_init(char *cmd)
{
    int i = 0;
    int argc;
    char *argv[10];

    btmg_log_level_t debug;

    argc = cmd_parse_argv(cmd, argv, cmd_nitems(argv));

    for (i = 0; i < argc; i++) {
        if (strcmp(argv[i], "-h") == 0) {
            CMD_DBG("Usage:\n"
                   "  [OPTION]...\n"
                   "\nOptions:\n"
                   "  -h, --help\t\tprint this help and exit\n"
                   "  -d, --debug\t open debug :-d [0~5]\n"
                   "  -p, --profile=NAME\tenable bluetooth profile\n"
                   "  [supported profile name]:\n"
                   "  - a2dp-source\tAdvanced Audio Source\n"
                   "  - a2dp-sink\tAdvanced Audio Sink\n"
                   "  - hfp-hf\tHands-Free\n"
                   "  - spp-server\tSerial Port Profile-Server role\n"
                   "  - spp-client\tSerial Port Profile-Client role\n"
                   "  - gatt-server\tble gatt server\n"
                   "  - gatt-client\tble gatt client\n");
            return CMD_STATUS_OK;
        }

        if (strcmp(argv[i], "-p") == 0) {
            if (i + 1 < argc) {
                int c;
                struct {
                    const char *name;
                    int value;
                } map[] = {
                    { "a2dp-sink",      BTMG_A2DP_SINK },
                    { "a2dp-source",    BTMG_A2DP_SOURCE },
                    { "hfp-hf",         BTMG_HFP_HF},
                    { "hfp-ag",         BTMG_HFP_AG},
                    { "spp-server",     BTMG_SPP_SERVER },
                    { "spp-client",     BTMG_SPP_CLIENT },
                    { "gatt-server",    BTMG_GATT_SERVER },
                    { "gatt-client",    BTMG_GATT_CLIENT},
                };

                for (c = 0; c < ARRAY_SIZE(map); c++) {
                    if (strcasecmp(argv[i+1], map[c].name) == 0) {
                        profile |= map[c].value;
                        break;
                    }
                }
                if (c == ARRAY_SIZE(map)) {
                    CMD_ERR("Invalid BT profile name: %s\n", argv[i+1]);
                }
            }else {
                CMD_ERR("invalid parameter, please specify a profile\n");
                break;
            }
        }

        if (strcmp(argv[i], "-d") == 0) {
            if (i + 1 < argc) {
                debug = (btmg_log_level_t)atoi(argv[i+1]);
                CMD_DBG("debug loglevel :%d\n", (int)debug);
                btmg_set_loglevel(debug);
            } else {
                CMD_ERR("invalid parameter, please specify a level\n");
                break;
            }
        }
    }
    if (btcli_init_state) {
        CMD_WRN("BT is already INIT!\n");
        return CMD_STATUS_OK;
    }

    if (profile == 0) {
        CMD_DBG("use default profile\n");
        profile |= BTMG_A2DP_SINK;
    }

    btmg_cbs.btmg_adapter_cb.state_cb = btcli_adapter_status_cb;
    btmg_cbs.btmg_adapter_cb.scan_status_cb = btcli_scan_status_cb;
    btmg_cbs.btmg_device_cb.device_add_cb = btcli_scan_dev_add_cb;
    btmg_cbs.btmg_adapter_cb.bonded_device_cb = btcli_bonded_device_cb;
    btmg_cbs.btmg_adapter_cb.get_name_cb = btcli_adapter_name_cb;
    btmg_cbs.btmg_device_cb.pindcoe_request_cb = btcli_device_pindcoe_request_cb;
    btmg_cbs.btmg_device_cb.passkey_request_cb = btcli_device_passkey_request_cb;
    btmg_cbs.btmg_device_cb.passkey_confirm_cb = btcli_device_passkey_confirm_cb;
    btmg_cbs.btmg_device_cb.pairing_confirm_cb = btcli_device_pairing_confirm_cb;
#ifdef CONFIG_BT_A2DP_ENABLE
    if (profile & BTMG_A2DP_SINK) {
        btmg_cbs.btmg_a2dp_sink_cb.conn_state_cb = btcli_a2dp_sink_connection_state_cb;
        btmg_cbs.btmg_a2dp_sink_cb.audio_state_cb = btcli_a2dp_sink_audio_state_cb;
    }
    if (profile & BTMG_A2DP_SOURCE) {
        btmg_cbs.btmg_a2dp_source_cb.conn_state_cb = btcli_a2dp_source_connection_state_cb;
        btmg_cbs.btmg_a2dp_source_cb.audio_state_cb = btcli_a2dp_source_audio_state_cb;
    }
    btmg_cbs.btmg_avrcp_cb.avrcp_ct_play_state_cb = btcli_avrcp_ct_play_state_cb;
    btmg_cbs.btmg_avrcp_cb.avrcp_ct_play_position_cb = btcli_avrcp_ct_play_position_cb;
    btmg_cbs.btmg_avrcp_cb.avrcp_ct_track_changed_cb = btcli_avrcp_ct_track_changed_cb;
    btmg_cbs.btmg_avrcp_cb.avrcp_tg_play_state_cb = btcli_avrcp_tg_play_state_cb;
    btmg_cbs.btmg_avrcp_cb.avrcp_audio_volume_cb = btcli_avrcp_audio_volume_cb;
#endif
#ifdef CONFIG_BT_SPP_ENABLED
    if (profile & BTMG_SPP_CLIENT) {
        btmg_cbs.btmg_sppc_cb.conn_state_cb = btcli_sppc_conn_status_cb;
        btmg_cbs.btmg_sppc_cb.recvdata_cb = btcli_sppc_recvdata_cb;
    }
    if (profile & BTMG_SPP_SERVER) {
        btmg_cbs.btmg_spps_cb.conn_state_cb = btcli_spps_conn_status_cb;
        btmg_cbs.btmg_spps_cb.recvdata_cb = btcli_spps_recvdata_cb;
    }
#endif
#ifdef CONFIG_BT_HFP_CLIENT_ENABLE
    if (profile & BTMG_HFP_HF) {
        btmg_cbs.btmg_hfp_hf_cb.conn_state_cb = btcli_hfp_hf_connection_state_cb;
        btmg_cbs.btmg_hfp_hf_cb.event_cb = btcli_hfp_hf_event_cb;
    }
#endif
#ifdef CONFIG_BT_HFP_AG_ENABLE
    if (profile & BTMG_HFP_AG) {
        btmg_cbs.btmg_hfp_ag_cb.conn_state_cb = btcli_hfp_ag_connection_state_cb;
        btmg_cbs.btmg_hfp_ag_cb.event_cb = btcli_hfp_ag_event_cb;
        btmg_cbs.btmg_hfp_ag_cb.audio_incoming_cb = btcli_hfp_ag_audio_incoming_cb;
        btmg_cbs.btmg_hfp_ag_cb.audio_outgoing_cb = btcli_hfp_ag_audio_outgoing_cb;
    }
#endif
    if (profile & BTMG_GATT_SERVER) {
        btmg_cbs.btmg_gatts_cb.conn_cb = btcli_ble_connection_cb;
        btmg_cbs.btmg_gatts_cb.get_db_cb = btcli_gatts_get_db_cb;
        btmg_cbs.btmg_gatts_cb.char_read_req_cb = btcli_gatts_char_read_req_cb;
        btmg_cbs.btmg_gatts_cb.char_write_req_cb = btcli_gatts_char_write_req_cb;
        btmg_cbs.btmg_gatts_cb.ccc_cfg_cb = btcli_gatts_ccc_cfg_cb;
    }
    if (profile & BTMG_GATT_CLIENT) {
        btmg_cbs.btmg_gattc_cb.le_scan_cb = btcli_ble_scan_cb;
        btmg_cbs.btmg_gattc_cb.conn_cb = btcli_ble_connection_cb;
        btmg_cbs.btmg_gattc_cb.dis_att_cb = btcli_gattc_dis_att_cb;
        btmg_cbs.btmg_gattc_cb.read_cb = btcli_gattc_read_cb;
        btmg_cbs.btmg_gattc_cb.write_cb = btcli_gattc_write_cb;
        btmg_cbs.btmg_gattc_cb.notify_indicate_cb = btcli_gattc_notify_indicate_cb;
    }

    btmg_core_init();
    btmg_register_callback(&btmg_cbs);
    btmg_set_profile(profile);
    btmg_adapter_enable(true);
    btcli_init_state = true;

    if (profile & BTMG_GATT_SERVER) {
        ble_gatt_register_service();
        ble_advertise_on();
    }

    return CMD_STATUS_OK;
}

enum cmd_status btcli_deinit(char *cmd)
{
    if (profile & BTMG_GATT_SERVER) {
        ble_gatt_unregister_service();
        btmg_le_enable_adv(false);
        btmg_gatt_attr_destory(db);
        db  = NULL;
    }
    btmg_adapter_enable(false);
    btmg_core_deinit();
    btmg_unregister_callback();
    btcli_init_state = false;

    if (discovered_devices != NULL) {
        btmg_dev_list_free(discovered_devices);
        discovered_devices = NULL;
    }

    return CMD_STATUS_OK;
}

static enum cmd_status btcli_source_help(char *cmd);

#define A2DP_SRC_BUFF_SIZE (512)

XR_OS_Thread_t a2dp_play_thread;
int music_fd = -1;

typedef enum {
    STOP = 0,
    PLAY,
    PAUSE,
    FORWARD,
    BACKWARD,
} play_state_t;

typedef struct {
    char music_path[128];
    int number;
} wav_musiclist_t;

typedef struct {
    char type;
    char parameter[128];
} a2dp_src_thread_args_t;

typedef struct {
    unsigned int riff_type;
    unsigned int riff_size;
    unsigned int wave_type;
    unsigned int format_type;
    unsigned int format_size;
    unsigned short compression_code;
    unsigned short num_channels;
    unsigned int sample_rate;
    unsigned int bytes_per_second;
    unsigned short block_align;
    unsigned short bits_per_sample;
    unsigned int data_type;
    unsigned int data_size;
} wav_header_t;

static bool a2dp_src_loop = false;
static bool is_folder_play = false;
wav_musiclist_t *musiclist = NULL;
static int musiclist_number = 1;
static a2dp_src_thread_args_t *thread_args = NULL;
play_state_t play_state;
bool dev_connnect, music_canwrite, is_pause = true;

static play_state_t get_play_state(void)
{
    return play_state;
}

static void set_play_state(play_state_t state)
{
    play_state = state;
}

void btcli_avrcp_tg_play_state_cb(const char *bd_addr, btmg_avrcp_play_state_t state)
{
    if (state == BTMG_AVRCP_PLAYSTATE_STOPPED) {
        CMD_DBG("Receive event[STOP] from devices device: %s\n", bd_addr);
        set_play_state(STOP);
    } else if (state == BTMG_AVRCP_PLAYSTATE_PLAYING) {
        CMD_DBG("Receive event[PLAY] from devices device: %s\n", bd_addr);
        set_play_state(PLAY);
    } else if (state == BTMG_AVRCP_PLAYSTATE_PAUSED) {
        CMD_DBG("Receive event[PAUSE] from devices device: %s\n", bd_addr);
        set_play_state(PAUSE);
    } else if (state == BTMG_AVRCP_PLAYSTATE_FORWARD) {
        CMD_DBG("Receive event[FORWARD] from devices device: %s\n", bd_addr);
        if (!is_folder_play) {
            CMD_WRN("need specify the folder with -p to start\n");
            return;
        }
        set_play_state(FORWARD);
    } else if (state == BTMG_AVRCP_PLAYSTATE_BACKWARD) {
        CMD_DBG("Receive event[BACKWARD] from devices device: %s\n", bd_addr);
        if (!is_folder_play) {
            CMD_WRN("need specify the folder with -p to start\n");
            return;
        }
        set_play_state(BACKWARD);
    }
}

static int open_file(char *file_path)
{
    return open(file_path, O_RDONLY);
}

static void close_file(int fd)
{
    close(fd);
}

static int traverse_musiclist(char *foldpath)
{
    char file_format[8] = { 0 };
    DIR *record_dir = NULL;
    struct dirent *de = NULL;
    FILE *file = NULL;
    int file_count = 0;

    record_dir = opendir(foldpath);
    if (record_dir == NULL) {
        CMD_ERR("Path OPEN error \n");
        return -1;
    }

    if (musiclist != NULL) {
        free(musiclist);
    }

    musiclist_number = 1;
    musiclist = (wav_musiclist_t *)malloc(1 * sizeof(wav_musiclist_t));

    while ((de = readdir(record_dir)) != 0) {
        if (strcmp(de->d_name, ".") == 0 || strcmp(de->d_name, "..") == 0) {
            continue;
        } else if (de->d_type == 1) { /* file */
            int filelen = strlen(de->d_name);
            memset(file_format, '\0', sizeof(file_format));
            strncpy(file_format, de->d_name + filelen - 3, 3); /* 记录文件格式 */
            if (!strcmp("wav", file_format)) {
                wav_musiclist_t *ml = &musiclist[musiclist_number - 1];
                if (foldpath[strlen(foldpath) - 1] != '/')
                    sprintf(ml->music_path, "%s/%s", foldpath, de->d_name);
                else
                    sprintf(ml->music_path, "%s%s", foldpath, de->d_name);

                ml->number = musiclist_number;
                musiclist_number++;
                CMD_DBG("find path:%s\n", ml->music_path);

                wav_musiclist_t *new_musiclist;
                new_musiclist = (wav_musiclist_t *)realloc(
                        musiclist, musiclist_number * sizeof(wav_musiclist_t));
                if (new_musiclist == NULL) {
                    CMD_ERR("realloc fail\n");
                    free(musiclist);
                    musiclist = NULL;
                    return -1;
                } else {
                    musiclist = new_musiclist;
                }
            }
        }
    }

    closedir(record_dir);
    return 0;
}

static void btcli_a2dp_src_thread(void *arg)
{
    int ret = -1;
    int send_len = -1;
    int path_length = 0;
    wav_header_t wav_header;
    static int wav_number = 0;
    char buffer[A2DP_SRC_BUFF_SIZE] = { 0 };
    char muisc_path[128] = { 0 };
    unsigned int c = 0, written = 0, count = 0, len = 0;
    a2dp_src_thread_args_t *thread_arg = (a2dp_src_thread_args_t *)arg;
    char type = thread_arg->type;

    if (type == 'f') {
        strcpy(muisc_path, thread_arg->parameter);
    } else if (type == 'p' | type == 'P') {
        ret = traverse_musiclist(thread_arg->parameter);
        if (ret == -1) {
            CMD_ERR("traverse musiclist fail \n");
            goto failed;
        }
        strcpy(muisc_path, (const char *)&musiclist[wav_number].music_path);
    }

start:
    c = 0, written = 0, count = 0, len = 0;
    path_length = strlen(muisc_path);
    if (path_length < 5) { //File path meets at least length 5
        CMD_ERR("Please enter the correct file path \n");
        goto failed;
    }

    if (strcmp(".wav", &muisc_path[path_length - 4])) {
        CMD_ERR("Please enter the correct audio format - 'wav'\n");
        goto failed;
    }

    if (music_fd > 0) {
        CMD_DBG("close music fd\n");
        close_file(music_fd);
    }

    music_fd = open_file(muisc_path);
    if (music_fd < 0) {
        CMD_ERR("Cannot open input file\n");
    }

    ret = read(music_fd, &wav_header, sizeof(wav_header_t));
    if (ret != sizeof(wav_header_t)) {
        CMD_ERR("read wav file header failed\n");
        close_file(music_fd);
        goto failed;
    }

    CMD_DBG("btcli_a2dp_src_thread start !\n");
    memset(buffer, 0, sizeof(buffer));
    btmg_a2dp_source_set_audio_param(wav_header.num_channels, wav_header.sample_rate);
    count = wav_header.data_size;
    CMD_DBG("start a2dp src loop, data size:%d, ch:%d, sample:%d ,path: %s \n",
            wav_header.data_size, wav_header.num_channels, wav_header.sample_rate, muisc_path);

    a2dp_src_loop = true;
    set_play_state(PLAY);

    while (a2dp_src_loop) {
        switch (get_play_state()) {
        case PLAY:
            if (is_pause) {
                btmg_a2dp_source_play_start();
                is_pause = false;
            }
            if (!music_canwrite) {
                /* Wait for the callback to complete before the
                other party's audio channel is actually opened */
                usleep(5);
                break;
            }
            if (send_len != 0) {
                c = count - written;
                if (c > A2DP_SRC_BUFF_SIZE) {
                    c = A2DP_SRC_BUFF_SIZE;
                }
                len = read(music_fd, buffer, c);
                if (len == 0) {
                    lseek(music_fd, 0, SEEK_SET);
                    written = 0;
                    CMD_DBG("audio file read complete\n");
                    continue;
                }
                if (len < 0) {
                    CMD_DBG("read file error,ret:%d,c=%d\n", len, c);
                    break;
                }
            } else {
                usleep(5);
            }
            if (len > 0) {
                if (get_play_state() != PLAY) {
                    usleep(5);
                    break;
                }
                send_len = btmg_a2dp_source_send_data(buffer, len);
                written += send_len;
            }
            break;
        case PAUSE:
            if (!is_pause) {
                btmg_a2dp_source_play_stop(false);
                music_canwrite = false, is_pause = true;
            }
            usleep(10 * 1000);
            break;
        case FORWARD:
            wav_number++;
            if (wav_number >= musiclist_number - 1) {
                wav_number = 0;
            }
            memset(muisc_path, 0, sizeof(muisc_path));
            strcpy(muisc_path, (const char *)&musiclist[wav_number].music_path);
            close_file(music_fd);
            music_fd = 0;
            a2dp_src_loop = false;
            goto start;
            break;
        case BACKWARD:
            wav_number--;
            if (wav_number < 0) {
                wav_number = musiclist_number - 1 - 1;
            }
            memset(muisc_path, 0, sizeof(muisc_path));
            strcpy(muisc_path, (const char *)&musiclist[wav_number].music_path);
            close_file(music_fd);
            music_fd = 0;
            a2dp_src_loop = false;
            goto start;
            break;
        case STOP:
            CMD_DBG("A2DP SRC Thread STOP\n");
            a2dp_src_loop = false;
            break;
        default:
            break;
        }
    }

    close_file(music_fd);
    music_fd = 0;
failed:
    CMD_DBG("Delete a2dp_play_thread\n");
    music_canwrite = false, is_pause = true;
    btmg_a2dp_source_play_stop(true);
    if (musiclist != NULL) {
        free(musiclist);
        musiclist = NULL;
    }
    if (thread_args != NULL) {
        free(thread_args);
        thread_args = NULL;
    }
    XR_OS_ThreadDelete(&a2dp_play_thread);
    return;
}

void btcli_a2dp_source_audio_state_cb(const char *bd_addr, btmg_a2dp_source_audio_state_t state)
{
    if (state == BTMG_A2DP_SOURCE_AUDIO_STARTED) {
        music_canwrite = true;
        set_play_state(PLAY);
        CMD_DBG("start btcli_a2dp_src_thread from devices device: %s\n", bd_addr);
    } else if (state == BTMG_A2DP_SOURCE_AUDIO_STOPPED) {
        music_canwrite = false;
        set_play_state(PAUSE); //need PAUSE not STOP
        CMD_DBG("stop btcli_a2dp_src_thread from devices device: %s\n", bd_addr);
    } else if (state == BTMG_A2DP_SOURCE_AUDIO_SUSPENDED) {
        /*SUSPENDED protocol stack not used???*/
        music_canwrite = false;
        set_play_state(PAUSE);
        CMD_DBG("a2dp source audio suspend from devices device: %s\n", bd_addr);
    }
}

void btcli_a2dp_source_connection_state_cb(const char *bd_addr,
                                           btmg_a2dp_source_connection_state_t state)
{
    if (state == BTMG_A2DP_SOURCE_DISCONNECTED) {
        /* It should be noted that there will be no disconnecting callback
        when the other party disconnects abnormally, so it is necessary to
        ensure that the thread can be released */
        set_play_state(STOP);
        dev_connnect = false;
        CMD_DBG("A2DP source disconnected with device: %s\n", bd_addr);
    } else if (state == BTMG_A2DP_SOURCE_CONNECTING) {
        CMD_DBG("A2DP source connecting with device: %s\n", bd_addr);
    } else if (state == BTMG_A2DP_SOURCE_CONNECTED) {
        dev_connnect = true;
        CMD_DBG("A2DP source connected with device: %s\n", bd_addr);
    } else if (state == BTMG_A2DP_SOURCE_DISCONNECTING) {
        //The disconnecting stage should exit the playback thread
        set_play_state(STOP);
        CMD_DBG("A2DP source disconnecting with device: %s\n", bd_addr);
    }
}

/* btcli a2dp_src connect <device mac> */
enum cmd_status btcli_source_connect(char *cmd)
{
    int argc;
    char *argv[1];

    argc = cmd_parse_argv(cmd, argv, 1);
    if (argc < 1) {
        CMD_ERR("invalid param number %d\n", argc);
        return CMD_STATUS_INVALID_ARG;
    }

    btmg_a2dp_source_connect(argv[0]);

    return CMD_STATUS_OK;
}

/* btcli a2dp_src disconnect <device mac> */
enum cmd_status btcli_source_disconnect(char *cmd)
{
    int argc;
    char *argv[1];

    argc = cmd_parse_argv(cmd, argv, 1);
    if (argc < 1) {
        CMD_ERR("invalid param number %d\n", argc);
        return CMD_STATUS_INVALID_ARG;
    }

    btmg_a2dp_source_disconnect(argv[0]);

    return CMD_STATUS_OK;
}

/* btcli a2dp_src start -f xxx.wav or btcli a2dp_src start -p /data */
enum cmd_status btcli_source_start(char *cmd)
{
    int ret = -1, i = 0, argc = 0, len = 0;
    char *argv[2];

    if (!dev_connnect) {
        CMD_ERR("Please complete the device connection first\n");
        return CMD_STATUS_FAIL;
    }

    if (get_play_state() != STOP | a2dp_src_loop == true) {
        CMD_WRN("a2dp_src_play_t thread already started\n");
        return CMD_STATUS_FAIL;
    }

    is_folder_play = false;

    argc = cmd_parse_argv(cmd, argv, 2);

    if (a2dp_src_loop == false) {
        if (thread_args)
            free(thread_args);
        thread_args = (a2dp_src_thread_args_t *)malloc(sizeof(a2dp_src_thread_args_t));
        if (strcmp("-f", argv[0]) == 0 || strcmp("-F", argv[0]) == 0) {
            thread_args->type = 'f';
            memset(thread_args->parameter, 0, sizeof(thread_args->parameter));
            strcpy(thread_args->parameter, argv[1]);
        } else if (strcmp("-p", argv[0]) == 0 || strcmp("-P", argv[0]) == 0) {
            thread_args->type = 'p';
            is_folder_play = true;
            memset(thread_args->parameter, 0, sizeof(thread_args->parameter));
            strcpy(thread_args->parameter, argv[1]);
        } else {
            CMD_ERR("please enter the parameters correctly \n");
            free(thread_args);
            thread_args = NULL;
            return CMD_STATUS_FAIL;
        }
    }

    XR_OS_ThreadCreate(&a2dp_play_thread, "a2dp_src_play_t", btcli_a2dp_src_thread,
                        thread_args, 2, 1024 * 6);

    return CMD_STATUS_OK;
}

/* btcli a2dp_src stop */
enum cmd_status btcli_source_stop(char *cmd)
{
    set_play_state(STOP);

    return CMD_STATUS_OK;
}

enum cmd_status btcli_source_control(char *cmd)
{
    int argc;
    char *argv[1];

    argc = cmd_parse_argv(cmd, argv, 1);
    if (argc < 1) {
        CMD_ERR("invalid param number %d\n", argc);
        return CMD_STATUS_INVALID_ARG;
    }

    if (!dev_connnect) {
        CMD_ERR("Please complete the device connection first\n");
        return CMD_STATUS_FAIL;
    }

    if (get_play_state() == STOP) {
        CMD_ERR("Please run first a2dp_src:  btcli a2dp_src start xxxx\n");
        return CMD_STATUS_FAIL;
    }

    if (strcmp("play", argv[0]) == 0) {
        set_play_state(PLAY);
    } else if (strcmp("pause", argv[0]) == 0) {
        set_play_state(PAUSE);
    } else if (strcmp("forward", argv[0]) == 0) {
        if (!is_folder_play) {
            CMD_ERR("need specify the folder with -p to start\n");
            CMD_STATUS_FAIL;
        }
        set_play_state(FORWARD);
    } else if (strcmp("backward", argv[0]) == 0) {
        if (!is_folder_play) {
            CMD_ERR("need specify the folder with -p to start\n");
            CMD_STATUS_FAIL;
        }
        set_play_state(BACKWARD);
    } else {
        CMD_ERR("This operation is not supported\n");
    }

    return CMD_STATUS_OK;
}

/* btcli a2dp_src vol */
enum cmd_status btcli_source_vol(char *cmd)
{
    int argc;
    char *argv[1];

    argc = cmd_parse_argv(cmd, argv, 1);
    if (argc < 1) {
        CMD_ERR("invalid param number %d\n", argc);
        return CMD_STATUS_INVALID_ARG;
    }
    int val = cmd_atoi(argv[0]);
    printf("val is %d", val);
    if (val < 0 || val > 99) {
        CMD_ERR("return failed\n");
        return CMD_STATUS_FAIL;
    }

    return CMD_STATUS_OK;
}

/*
    $btcli a2dp_src connect <mac>
    $btcli a2dp_src disconnect <mac>
    $btcli a2dp_src start
    $btcli a2dp_src stop
    $btcli a2dp_src control
    $btcli a2dp_src vol <val>
*/
static const struct cmd_data a2dp_source_cmds[] = {
    { "connect",    btcli_source_connect,    CMD_DESC("<device mac>")},
    { "disconnect", btcli_source_disconnect, CMD_DESC("<device mac>")},
    { "start",      btcli_source_start,      CMD_DESC("<-p [folder path] or -f [file path]>")},
    { "control",    btcli_source_control,    CMD_DESC("<cmd>(pause play forward backward)")},
    { "stop",       btcli_source_stop,       CMD_DESC("No parameters")},
    { "vol",        btcli_source_vol,        CMD_DESC("<val>(val:0~100)")},
    { "help",       btcli_source_help,       CMD_DESC(CMD_HELP_DESC)},
};

/* btcli a2dp_src help */
static enum cmd_status btcli_source_help(char *cmd)
{
    return cmd_help_exec(a2dp_source_cmds, cmd_nitems(a2dp_source_cmds), 10);
}

enum cmd_status btcli_a2dp_source(char *cmd)
{
    return cmd_exec(cmd, a2dp_source_cmds, cmd_nitems(a2dp_source_cmds));
}
```

##### 初始化

1. 总回调结构体是 btmg_callback_t，先设置 a2dp source 相关回调函数；
2. 调用 btmg_core_init 初始化 btmanager;
3. 调用 btmg_register_callback 注册步骤 1 设置好的回调函数；
4. 调用 btmg_set_profile(BTMG_A2DP_SOURCE) 使能蓝牙 Profile；
5. 调用 btmg_adapter_enable(true) 使能蓝牙；
6. 蓝牙使能成功后触发 state_cb，参考 btcli_adapter_status_cb；
7. 在 state_cb 中调用 btmg_adapter_set_name，设置蓝牙名称；
8. 在 state_cb 中调用 btmg_adapter_set_io_capability，设置 io_capability 能力；
9. 在 state_cb 中调用 btmg_adapter_set_scanmode，设置发现模式；

##### 扫描连接

蓝牙初始化完成后，可以扫描和连接周围设备。

1. 调用 btmg_adapter_start_scan 扫描周围设备，可参考 btcli_scan。发起扫描后，扫到的设备会通过 btmg_device_cb.device_add_cb 回调，此时应用可以把设备管理起来，建立应用的扫描列表，可参考 btcli_scan_dev_add_cb，扫描列表可以参考 btcli_scan_list，请根据自身需求管理设备列表；
2. 调 用 btmg_a2dp_source_connect 指 定 设 备 （mac 地 址） 发 起 连 接， 连 接 状 态 通 过btmg_a2dp_source_cb.conn_state_cb 上报，根据连接或断开做应用逻辑开发，可参考btcli_a2dp_source_connection_state_cb；

##### 音频播放

设备连接后，可以往 A2DP Sink 设备推流。音频播放根据数据处理的方式不同分为两种：

1. btmanager 通路

btmanager 包含抖动 fifo、音频重采样的功能，直接使用 A2DP Source API 开发即可。

2. Audio System 通路

Audio System 对接 btmanager，把 A2DP Source 蓝牙设备抽象为一个声卡，细节可以参考 Audio 的开发指南文档。btmanager 也需要做相应的配置，btmanager 通路和 Audio System 通路只能二选一；

###### bt_manager 通路

请参考 btcli_a2dp_source.c 的实现，目前只支持接收 PCM 数据，因此应用推送的音频流务必是PCM 数据，发送流程如下：

1. 通过 btmg_a2dp_source_play_start 函数通知协议栈准备开始处理数据；
2. 通过 btmg_a2dp_source_set_audio_param 把将要播放音频流的通道数和采样率传递给btmanager。除第一次外，以后在音频参数变化时调用即可。例如当前播放的是 44100HZ，单声道的音频 A，播放完音频 A 之后，需要如果要播放44100HZ，单声道的音频 B，可以不用进行重新设置。但如果要播放的是 48000HZ，单声道的音频 C，务必调用，否则播放不正常；
3. 通过 btmg_a2dp_source_send_data 把 pcm 传递给 bt_manager，建议每次发送 512 字节，bt_manager 内部对数据处理（缓存与重采样），再把数据传给协议栈，协议栈把数据编码成 SBC 格式给到蓝牙控制器，蓝牙控制器最终通过无线射频传给对端蓝牙设备。反复调用send_data 接口直到数据发完完毕；
4. 设置/获取蓝牙音乐播放音量可以通过 btmg_avrc_set_absolute_volume/btmg_avrc_get_absolute_volume 接口;
5. 如果不再发送数据，务必调用 btmg_a2dp_source_play_stop 告知协议栈停止数据处理;

###### Audio System 通路

1. 默认不走此通路，RV 核需要做以下配置

```
System components ‑‑‑>
	aw components ‑‑‑>
		wireless ‑‑‑>
			[*] btmanager ‑‑‑>
 			   [*] Enable AudioTrack send audio data
 			   
		AudioSystem Support‑‑‑>
			AW Audio System Support ‑‑‑>
				Audio HW Support ‑‑‑>
```

##### 反初始化

反初始化是指关闭蓝牙，可以参考 btcli_deinit，主要是以下函数：

```c
btmg_adapter_enable(false);
btmg_core_deinit();
btmg_unregister_callback(void);
```

还需要关注释放应用额外申请的内存资源等。

### HFP HF 开发

####  HFP HF API

| API 接口                                  | 说明                                                     |
| ----------------------------------------- | -------------------------------------------------------- |
| btmg_hfp_hf_connect                       | 连接指定设备                                             |
| btmg_hfp_hf_disconnect                    | 断开与指定设备的连接                                     |
| btmg_hfp_hf_start_voice_recognition       | 开启语音识别                                             |
| btmg_hfp_hf_stop_voice_recognition        | 关闭语音识别                                             |
| btmg_hfp_hf_spk_vol_update                | 更新扩音器音量                                           |
| btmg_hfp_hf_mic_vol_update                | 更新麦克风音量                                           |
| btmg_hfp_hf_dial                          | 指定号码拨打电话                                         |
| btmg_hfp_hf_dial_memory                   | 快速拨号，手机必须有设置快速拨号的号码                   |
| btmg_hfp_hf_send_chld_cmd                 | 多方通话控制                                             |
| btmg_hfp_hf_send_btrh_cmd                 | 发送响应和保持动作的命令                                 |
| btmg_hfp_hf_answer_call                   | 接听来电                                                 |
| btmg_hfp_hf_reject_call                   | 拒绝来电                                                 |
| btmg_hfp_hf_query_calls                   | 查询当前通话列表                                         |
| btmg_hfp_hf_query_operator                | 查询当前选择的网络运营商名称                             |
| btmg_hfp_hf_query_number                  | 查阅本机号码                                             |
| btmg_hfp_hf_send_dtmf                     | 在通话过程中传输 DTMF 码，即在通话过程中使用键盘输入内容 |
| btmg_hfp_hf_request_last_voice_tag_number | 向 AG 请求与最后录制的语音标签相对应的电话号码           |
| btmg_hfp_hf_send_nrec                     | 关闭回声消除和降噪                                       |

#### HFP HF API 调用流程

```c
#include <AudioSystem.h>

static enum cmd_status btcli_hfp_help(char *cmd);

static const char *s_hfp_event_str[] = { "BTMG_HFP_HF_BVRA_EVT",
                                         "BTMG_HFP_HF_CIND_CALL_EVT",
                                         "BTMG_HFP_HF_CIND_CALL_SETUP_EVT",
                                         "BTMG_HFP_HF_CIND_CALL_HELD_EVT",
                                         "BTMG_HFP_HF_CIND_SERVICE_AVAILABILITY_EVT",
                                         "BTMG_HFP_HF_CIND_SIGNAL_STRENGTH_EVT",
                                         "BTMG_HFP_HF_CIND_ROAMING_STATUS_EVT",
                                         "BTMG_HFP_HF_CIND_BATTERY_LEVEL_EVT",
                                         "BTMG_HFP_HF_COPS_CURRENT_OPERATOR_EVT",
                                         "BTMG_HFP_HF_BTRH_EVT",
                                         "BTMG_HFP_HF_CLIP_EVT",
                                         "BTMG_HFP_HF_CCWA_EVT",
                                         "BTMG_HFP_HF_CLCC_EVT",
                                         "BTMG_HFP_HF_VOLUME_CONTROL_EVT",
                                         "BTMG_HFP_HF_CNUM_EVT",
                                         "BTMG_HFP_HF_BSIR_EVT",
                                         "BTMG_HFP_HF_BINP_EVT",
                                         "BTMG_HFP_HF_RING_IND_EVT" };

static const char *_hfp_event_to_string(btmg_hfp_hf_event_t event)
{
    return s_hfp_event_str[event - 2];
}

#ifdef XRADIO_HFP_ADJUST_VOLUME
#define XRADIO_AMIXER_HFP_MAX 63
static uint8_t bluedroid_amixer(uint8_t volume)
{
    int ret = 0;
    int type = AUDIO_STREAM_SYSTEM;
    uint32_t volume_value = 0;
    uint8_t max_volume = 0;

    ret = softvol_control_with_streamtype(type, &volume_value, 2);
    if (ret != 0) {
        CMD_ERR("get softvol range failed:%d\n", ret);
        return -1;
    }
    max_volume = (volume_value >> 16) & 0xffff;
    volume_value = (value * max_volume / 100) & 0xffff;
    ret = softvol_control_with_streamtype(type, &volume_value, 1);
    if (ret != 0) {
        CMD_ERR("set softvol failed:%d\n", ret);
        return -1;
    }

    return ret;
}
#endif

void btcli_hfp_hf_connection_state_cb(const char *bd_addr, btmg_hfp_hf_connection_state_t state)
{
    if (state == BTMG_HFP_HF_DISCONNECTED) {
        CMD_DBG("hfp hf disconnected with device: %s\n", bd_addr);
    } else if (state == BTMG_HFP_HF_CONNECTING) {
        CMD_DBG("hfp hf connecting with device: %s\n", bd_addr);
    } else if (state == BTMG_HFP_HF_CONNECTED) {
        CMD_DBG("hfp hf connected with device: %s\n", bd_addr);
    } else if (state == BTMG_HFP_HF_SLC_CONNECTED) {
        CMD_DBG("hfp hf slc_connected with device: %s\n", bd_addr);
    } else if (state == BTMG_HFP_HF_DISCONNECTING) {
        CMD_DBG("hfp hf disconnecting with device: %s\n", bd_addr);
    }
}

void btcli_hfp_hf_event_cb(btmg_hfp_hf_event_t event, void *data)
{
    CMD_DBG("event:%s \n", _hfp_event_to_string(event));
}

/* btcli hfp voice_rec <0/1> */
static enum cmd_status btcli_hfp_voice_recognition(char *cmd)
{
    btmg_err ret;
    int start = 0;

    /* get param */
    int cnt = cmd_sscanf(cmd, "%d ", &start);
    if (cnt != 1) {
        CMD_ERR("invalid param number %d\n", cnt);
        return CMD_STATUS_INVALID_ARG;
    }

    if (start == 1) {
        if ((ret = btmg_hfp_hf_start_voice_recognition()) != BT_OK) {
            CMD_ERR("return failed: %d\n", ret);
            return CMD_STATUS_FAIL;
        }
    } else if (start == 0) {
        if ((ret = btmg_hfp_hf_stop_voice_recognition() != BT_OK)) {
            CMD_ERR("return failed: %d\n", ret);
            return CMD_STATUS_FAIL;
        }
    } else {
        CMD_ERR("invalid param %d\n", start);
        return CMD_STATUS_INVALID_ARG;
    }

    return CMD_STATUS_OK;
}

/* btcli hfp vol_update <spk/mic> <vol> */
static enum cmd_status btcli_hfp_vol_update(char *cmd)
{
    btmg_err ret;
    char devc[10] = { 0 };
    int vol;

    /* get param */
    int cnt = cmd_sscanf(cmd, "%s %d", devc, &vol);
    if (cnt != 2) {
        CMD_ERR("invalid param number %d\n", cnt);
        return CMD_STATUS_INVALID_ARG;
    }

    if (!cmd_strcmp(devc, "spk")) {
        if ((ret = btmg_hfp_hf_spk_vol_update(vol)) != BT_OK) {
            CMD_ERR("return failed: %d\n", ret);
            return CMD_STATUS_FAIL;
        }
#ifdef XRADIO_HFP_ADJUST_VOLUME
        int ret = -1;
        CMD_DBG("adjusting the volume by ourselves\n");
        vol = XRADIO_AMIXER_HFP_MAX - (uint32_t)vol * 4;
        CMD_DBG("volume is %d\n", vol);
        ret = bluedroid_amixer(vol);
        if (ret != XR_OK) {
            CMD_ERR("Set vol by ourself failed \n");
        }
#endif
    } else if (!cmd_strcmp(devc, "mic")) {
        if ((ret = btmg_hfp_hf_mic_vol_update(vol)) != BT_OK) {
            CMD_ERR("return failed: %d\n", ret);
            return CMD_STATUS_FAIL;
        }
    } else {
        CMD_ERR("invalid param %s\n", devc);
        return CMD_STATUS_INVALID_ARG;
    }

    return CMD_STATUS_OK;
}

/* btcli hfp dial 10086 */
static enum cmd_status btcli_hfp_dial(char *cmd)
{
    btmg_err ret;
    char number[30] = { 0 };

    /* get param */
    int cnt = cmd_sscanf(cmd, "%s", number);
    if (cnt != 1) {
        CMD_ERR("invalid param number %d\n", cnt);
        return CMD_STATUS_INVALID_ARG;
    }

    if ((ret = btmg_hfp_hf_dial(number)) != BT_OK) {
        CMD_ERR("return failed: %d\n", ret);
        return CMD_STATUS_FAIL;
    }

    return CMD_STATUS_OK;
}

/* btcli hfp dial_mem 2 */
static enum cmd_status btcli_hfp_dial_mem(char *cmd)
{
    btmg_err ret;
    int loc;

    /* get param */
    int cnt = cmd_sscanf(cmd, "%d", &loc);
    if (cnt != 1) {
        CMD_ERR("invalid param number %d\n", cnt);
        return CMD_STATUS_INVALID_ARG;
    }

    if ((ret = btmg_hfp_hf_dial_memory(loc)) != BT_OK) {
        CMD_ERR("return failed: %d\n", ret);
        return CMD_STATUS_FAIL;
    }

    return CMD_STATUS_OK;
}

/* btcli hfp chld 0 0 */
static enum cmd_status btcli_hfp_chld(char *cmd)
{
    btmg_err ret;
    int chld;
    int idx = 0;

    /* get param */
    int cnt = cmd_sscanf(cmd, "%d %d", &chld, &idx);
    if (cnt != 2 && (chld == BTMG_HF_CHLD_TYPE_REL_X || chld == BTMG_HF_CHLD_TYPE_PRIV_X)) {
        CMD_ERR("invalid param number %d\n", cnt);
        return CMD_STATUS_INVALID_ARG;
    }

    if ((ret = btmg_hfp_hf_send_chld_cmd((btmg_hf_chld_type_t)chld, idx)) != BT_OK) {
        CMD_ERR("return failed: %d\n", ret);
        return CMD_STATUS_FAIL;
    }

    return CMD_STATUS_OK;
}

/* btcli hfp btrh <hold/accept/reject> */
static enum cmd_status btcli_hfp_btrh(char *cmd)
{
    btmg_err ret;
    char btrhcmd[10] = { 0 };
    btmg_hf_btrh_cmd_t btrh;

    /* get param */
    int cnt = cmd_sscanf(cmd, "%s", btrhcmd);
    if (cnt != 1) {
        CMD_ERR("invalid param number %d\n", cnt);
        return CMD_STATUS_INVALID_ARG;
    }

    if (!cmd_strcmp(btrhcmd, "hold"))
        btrh = BTMG_HF_BTRH_CMD_HOLD;
    else if (!cmd_strcmp(btrhcmd, "accept"))
        btrh = BTMG_HF_BTRH_CMD_ACCEPT;
    else if (!cmd_strcmp(btrhcmd, "reject"))
        btrh = BTMG_HF_BTRH_CMD_REJECT;
    else {
        CMD_ERR("invalid param %s\n", btrhcmd);
        return CMD_STATUS_INVALID_ARG;
    }

    if ((ret = btmg_hfp_hf_send_btrh_cmd(btrh)) != BT_OK) {
        CMD_ERR("return failed: %d\n", ret);
        return CMD_STATUS_FAIL;
    }
    return CMD_STATUS_OK;
}

/* btcli hfp answer */
static enum cmd_status btcli_hfp_answer(char *cmd)
{
    btmg_err ret;

    if ((ret = btmg_hfp_hf_answer_call() != BT_OK)) {
        CMD_ERR("return failed: %d\n", ret);
        return CMD_STATUS_FAIL;
    }
    return CMD_STATUS_OK;
}

/* btcli hfp reject */
static enum cmd_status btcli_hfp_reject(char *cmd)
{
    btmg_err ret;

    if ((ret = btmg_hfp_hf_reject_call()) != BT_OK) {
        CMD_ERR("return failed: %d\n", ret);
        return CMD_STATUS_FAIL;
    }
    return CMD_STATUS_OK;
}

/* btcli hfp query <call/name> */
static enum cmd_status btcli_hfp_query(char *cmd)
{
    btmg_err ret;
    char query[10] = { 0 };

    /* get param */
    int cnt = cmd_sscanf(cmd, "%s", query);
    if (cnt != 1) {
        CMD_ERR("invalid param number %d\n", cnt);
        return CMD_STATUS_INVALID_ARG;
    }

    if (!cmd_strcmp(query, "call")) {
        if ((ret = btmg_hfp_hf_query_calls()) != BT_OK) {
            CMD_ERR("return failed: %d\n", ret);
            return CMD_STATUS_FAIL;
        }
    } else if (!cmd_strcmp(query, "name")) {
        if ((ret = btmg_hfp_hf_query_operator()) != BT_OK) {
            CMD_ERR("return failed: %d\n", ret);
            return CMD_STATUS_FAIL;
        }
    } else {
        CMD_ERR("invalid param %s\n", query);
        return CMD_STATUS_INVALID_ARG;
    }

    return CMD_STATUS_OK;
}

/* btcli hfp number */
static enum cmd_status btcli_hfp_phone_number(char *cmd)
{
    btmg_err ret;

    if ((ret = btmg_hfp_hf_query_number()) != BT_OK) {
        CMD_ERR("return failed: %d\n", ret);
        return CMD_STATUS_FAIL;
    }
    return CMD_STATUS_OK;
}

/* btcli hfp dtmf <0-9/#/ * > */
static enum cmd_status btcli_hfp_dtmf(char *cmd)
{
    btmg_err ret;
    char c = '\0';

    /* get param */
    int cnt = cmd_sscanf(cmd, "%c", &c);
    if (cnt != 1) {
        CMD_ERR("invalid param number %d\n", cnt);
        return CMD_STATUS_INVALID_ARG;
    }

    if ((ret = btmg_hfp_hf_send_dtmf(c)) != BT_OK) {
        CMD_ERR("return failed: %d\n", ret);
        return CMD_STATUS_FAIL;
    }
    return CMD_STATUS_OK;
}

/* btcli hfp last_vnum */
static enum cmd_status btcli_hfp_last_vnum(char *cmd)
{
    btmg_err ret;

    if ((ret = btmg_hfp_hf_request_last_voice_tag_number()) != BT_OK) {
        CMD_ERR("return failed: %d\n", ret);
        return CMD_STATUS_FAIL;
    }
    return CMD_STATUS_OK;
}

/* btcli hfp nrec_close */
static enum cmd_status btcli_hfp_nrec_close(char *cmd)
{
    btmg_err ret;

    if ((ret = btmg_hfp_hf_send_nrec()) != BT_OK) {
        CMD_ERR("return failed: %d\n", ret);
        return CMD_STATUS_FAIL;
    }
    return CMD_STATUS_OK;
}

static const struct cmd_data hfp_cmds[] = {
    { "voice_rec",  btcli_hfp_voice_recognition,  CMD_DESC("<state：1/0>") },
    { "vol_update", btcli_hfp_vol_update,         CMD_DESC("<spk/mic> <vol>")},
    { "dial",       btcli_hfp_dial,               CMD_DESC("<phone_num>")},
    { "dial_mem",   btcli_hfp_dial_mem,           CMD_DESC("<local>")},
    { "chld",       btcli_hfp_chld,               CMD_DESC("<type：0~6> <index>")},
    { "btrh",       btcli_hfp_btrh,               CMD_DESC("<hold/accept/reject>")},
    { "answer",     btcli_hfp_answer,             CMD_DESC("No parameters")},
    { "reject",     btcli_hfp_reject,             CMD_DESC("No parameters")},
    { "query",      btcli_hfp_query,              CMD_DESC("<call/name>")},
    { "number",     btcli_hfp_phone_number,        CMD_DESC("No parameters")},
    { "dtmf",       btcli_hfp_dtmf,               CMD_DESC("<code：0-9，#，*，A-D>")},
    { "last_vnum",  btcli_hfp_last_vnum,          CMD_DESC("No parameters")},
    { "nrec_close", btcli_hfp_nrec_close,         CMD_DESC("No parameters")},
    { "help",       btcli_hfp_help,               CMD_DESC(CMD_HELP_DESC) },
};

static enum cmd_status btcli_hfp_help(char *cmd)
{
	return cmd_help_exec(hfp_cmds, cmd_nitems(hfp_cmds), 10);
}

enum cmd_status btcli_hfp(char *cmd)
{
    return cmd_exec(cmd, hfp_cmds, cmd_nitems(hfp_cmds));
}
```

##### 初始化

1.  总回调结构体是 btmg_callback_t，先设置 hfp hf 的回调函数；
2. 调用 btmg_core_init 初始化 bt_manager;
3. 调用 btmg_register_callback 注册步骤 1 设置好的回调函数；
4. 调用 btmg_set_profile(BTMG_HFP_HF) 使能蓝牙 Profile；如果与 A2DP Sink 一起使用，调用 btmg_set_profile(BTMG_HFP_HF | BTMG_A2DP_SINK )；
5. 调用 btmg_adapter_enable(true) 使能蓝牙；
6. 蓝牙使能成功后触发 state_cb，参考 btcli_adapter_status_cb；
7. 在 state_cb 中调用 btmg_adapter_set_name，设置蓝牙名称；
8. 在 state_cb 中调用 btmg_adapter_set_io_capability，设置 io_capability 能力；
9. 在 state_cb 中调用 btmg_adapter_set_scanmode，设置发现模式；

##### 设备连接

1. 初始化完成后，手机可以搜索与连接，连接的回调函数 btmg_hfp_hf_cb.conn_state_cb。在连接过程中，会存在 AT 命令的交互，因此会收到相关 AT 的事件，在btmg_hfp_hf_cb.event_cb 回调上来，在示例中只是把相关事件打印出来。
2. 如果需要主动连接与断开，使用 btmg_hfp_hf_connect 或 btmg_hfp_hf_disconnect 接口。

##### 通话与控制

1. 手机收到来电，并且手机端主动接听电话后，设备会接管手机的通话功能，通话的声音会在设备扬声器播放，通话的录音也会使用设备的麦克风。当前播放和录音的处理放在 bt_manager内部处理，后续计划透出相关的数据 cb；
2. 如果需要在设备上接听电话，挂断电话等控制，一般需要通过发送 AT 命令，相关的命令已经通过 API 的方式集成，用户可以参考 btcli_hfp.c 相关命令的实现。

##### 反初始化

反初始化参考 btcli_deinit，主要是以下函数：

```c
btmg_adapter_enable(false);
btmg_core_deinit();
btmg_unregister_callback(void);
```

### SPP Client 开发

SPP Profile 一般用于数据透传，常见应用是连接蓝牙打印机发送打印数据。

#### SPP Client API

| API 接口             | 说明                 |
| -------------------- | -------------------- |
| btmg_sppc_connect    | 连接 SPP Server 设备 |
| btmg_sppc_disconnect | 断开与对端设备连接   |
| btmg_sppc_write      | 发送数据给对端设备   |

#### SPP Client API 调用流程

HFP HF 功能的使用示例：

```c
#include <stdint.h>
#include <string.h>
#include <stdbool.h>
#include <stdio.h>

#include "cmd_util.h"
#include "bt_manager.h"

static enum cmd_status btcli_sppc_help(char *cmd);

void btcli_sppc_conn_status_cb(const char *bd_addr, btmg_spp_connection_state_t state)
{
    if (state == BTMG_SPP_DISCONNECTED) {
        CMD_DBG("spp client disconnected with device: %s\n", bd_addr);
    } else if (state == BTMG_SPP_CONNECTING) {
        CMD_DBG("spp client connecting with device: %s\n", bd_addr);
    } else if (state == BTMG_SPP_CONNECTED) {
        CMD_DBG("spp client connected with device: %s\n", bd_addr);
    } else if (state == BTMG_SPP_DISCONNECTING) {
        CMD_DBG("spp client disconnecting with device: %s\n", bd_addr);
    } else if (state == BTMG_SPP_CONNECT_FAILED) {
        CMD_DBG("spp client connect with device: %s failed!\n", bd_addr);
    } else if (state == BTMG_SPP_DISCONNEC_FAILED) {
        CMD_DBG("spp client disconnect with device: %s failed!\n", bd_addr);
    }
}

void btcli_sppc_recvdata_cb(const char *bd_addr, char *data, int data_len)
{
    char recv_data[data_len + 1];

    memcpy(recv_data, data, data_len);
    recv_data[data_len] = '\0';

    CMD_DBG("sppc recv from dev:[%s],[len=%d][data:%s]\n", bd_addr, data_len,
            recv_data);
}

/* btcli sppc connect <device mac> */
static enum cmd_status btcli_sppc_connect(char *cmd)
{
    int argc;
    char *argv[1];

    argc = cmd_parse_argv(cmd, argv, 1);
    if (argc != 1) {
        CMD_ERR("invalid param number %d\n", argc);
        return CMD_STATUS_INVALID_ARG;
    }

    btmg_sppc_connect(argv[0]);

    return CMD_STATUS_OK;
}

/* btcli sppc disconnect <device mac> */
static enum cmd_status btcli_sppc_disconnect(char *cmd)
{
    int argc;
    char *argv[1];

    argc = cmd_parse_argv(cmd, argv, 1);
    if (argc != 1) {
        CMD_ERR("invalid param number %d\n", argc);
        return CMD_STATUS_INVALID_ARG;
    }

    btmg_sppc_disconnect(argv[0]);

    return CMD_STATUS_OK;
}

/* btcli sppc write <data> */
static enum cmd_status btcli_sppc_write(char *cmd)
{
    int argc;
    char *argv[1];

    argc = cmd_parse_argv(cmd, argv, 1);
    if (argc != 1) {
        CMD_ERR("invalid param number %d\n", argc);
        return CMD_STATUS_INVALID_ARG;
    }

    btmg_sppc_write(argv[0], strlen(argv[0]));

    return CMD_STATUS_OK;
}

static const struct cmd_data sppc_cmds[] = {
    { "connect",    btcli_sppc_connect,     CMD_DESC("<device mac>")},
    { "disconnect", btcli_sppc_disconnect,  CMD_DESC("<device mac>")},
    { "write",      btcli_sppc_write,       CMD_DESC("<data>")},
    { "help",       btcli_sppc_help,      CMD_DESC(CMD_HELP_DESC)},
};

/* btcli sppc help */
static enum cmd_status btcli_sppc_help(char *cmd)
{
	return cmd_help_exec(sppc_cmds, cmd_nitems(sppc_cmds), 10);
}

enum cmd_status btcli_sppc(char *cmd)
{
    return cmd_exec(cmd, sppc_cmds, cmd_nitems(sppc_cmds));
}
```

##### 初始化

1. 总回调结构体是 btmg_callback_t，先设置 spp client 的回调函数；
2. 调用 btmg_core_init 初始化 bt_manager;
3. 调用 btmg_register_callback 注册步骤 1 设置好的回调函数；
4. 调用 btmg_set_profile(BTMG_SPP_CLIENT) 使能蓝牙 Profile；
5. 调用 btmg_adapter_enable(true) 使能蓝牙；
6. 蓝牙使能成功后触发 state_cb，参考 btcli_adapter_status_cb；
7. 在 state_cb 中调用 btmg_adapter_set_name，设置蓝牙名称；
8. 在 state_cb 中调用 btmg_adapter_set_io_capability，设置 io_capability 能力；
9. 在 state_cb 中调用 btmg_adapter_set_scanmode，设置发现模式；

##### 扫描连接

初始化完成后可以发起扫描连接

1. 扫描接口使用 btmg_adapter_start_scan；
2. 扫描到目标设备后，先使用btmg_adapter_stop_scan停止扫描，再使用btmg_sppc_connect发起连接；连接状态通过回调函数 btmg_sppc_cb.conn_state_cb 上报。
3. 如果需要主动断开连接使用 btmg_sppc_disconnect；

##### 数据收发

1. 通过 btmg_sppc_write 发送数据；
2. 如果对端回复数据，会通过 btmg_sppc_cb.recvdata_cb 回调。

### SPP Server 开发

#### SPP Server API

| API 接口             | 说明                                |
| -------------------- | :---------------------------------- |
| btmg_spps_start      | 指定 Server Channel 启动 SPP server |
| btmg_spps_stop       | 停止 SPP server                     |
| btmg_spps_write      | 发送数据给对端设备                  |
| btmg_spps_disconnect | 断开设备连接                        |

#### SPP Server API 调用流程

HFP HF 功能的使用示例

```c
#include <stdint.h>
#include <string.h>
#include <stdbool.h>
#include <stdio.h>

#include "cmd_util.h"
#include "bt_manager.h"

static enum cmd_status btcli_spps_help(char *cmd);

void btcli_spps_conn_status_cb(const char *bd_addr, btmg_spp_connection_state_t state)
{
    if (state == BTMG_SPP_DISCONNECTED) {
        CMD_DBG("spp server disconnected with device: %s\n", bd_addr);
    } else if (state == BTMG_SPP_CONNECTING) {
        CMD_DBG("spp server connecting with device: %s\n", bd_addr);
    } else if (state == BTMG_SPP_CONNECTED) {
        CMD_DBG("spp server connected with device: %s\n", bd_addr);
    } else if (state == BTMG_SPP_DISCONNECTING) {
        CMD_DBG("spp server disconnecting with device: %s\n", bd_addr);
    } else if (state == BTMG_SPP_CONNECT_FAILED) {
        CMD_DBG("spp server connect with device: %s failed!\n", bd_addr);
    } else if (state == BTMG_SPP_DISCONNEC_FAILED) {
        CMD_DBG("spp server disconnect with device: %s failed!\n", bd_addr);
    }
}

void btcli_spps_recvdata_cb(const char *bd_addr, char *data, int data_len)
{
    char recv_data[data_len + 1];

    memcpy(recv_data, data, data_len);
    recv_data[data_len] = '\0';
    CMD_DBG("spps recv from dev:[%s][len=%d][data:%s]\n", bd_addr, data_len,
            recv_data);
}

/* btcli spps start <scn> */
static enum cmd_status btcli_spps_start(char *cmd)
{
    int argc;
    int scn = 0;
    char *argv[1];
    argc = cmd_parse_argv(cmd, argv, 1);

    if (argc != 1) {
        CMD_ERR("invalid param number %d\n", argc);
        return CMD_STATUS_INVALID_ARG;
    }

    scn = cmd_atoi(argv[0]);

    if (btmg_spps_start(scn) != BT_OK) {
        CMD_ERR("spps start fail\n");
    }

    return CMD_STATUS_OK;
}

/* btcli spps stop */
static enum cmd_status btcli_spps_stop(char *cmd)
{
    int argc;
    char *argv[1];
    argc = cmd_parse_argv(cmd, argv, 1);

    if (argc > 1) {
        CMD_ERR("invalid param number %d\n", argc);
        return CMD_STATUS_INVALID_ARG;
    }

    btmg_spps_stop();

    return CMD_STATUS_OK;
}

/* btcli spps disconnect <device mac> */
static enum cmd_status btcli_spps_disconnect(char *cmd)
{
    int argc;
    char *argv[1];
    argc = cmd_parse_argv(cmd, argv, 1);

    if (argc != 1) {
        CMD_ERR("invalid param number %d\n", argc);
        return CMD_STATUS_INVALID_ARG;
    }

    btmg_spps_disconnect(argv[0]);

    return CMD_STATUS_OK;
}

/* btcli spps write <data>*/
static enum cmd_status btcli_spps_write(char *cmd)
{
    int argc;
    char *argv[1];
    argc = cmd_parse_argv(cmd, argv, 1);

    if (argc != 1) {
        CMD_ERR("invalid param number %d\n", argc);
        return CMD_STATUS_INVALID_ARG;
    }

    btmg_spps_write(argv[0], strlen(argv[0]));

    return CMD_STATUS_OK;
}

static const struct cmd_data spps_cmds[] = {
    { "start",      btcli_spps_start,      CMD_DESC("<scn>")},
    { "stop",       btcli_spps_stop,       CMD_DESC("No parameters")},
    { "disconnect", btcli_spps_disconnect, CMD_DESC("<device mac>")},
    { "write",      btcli_spps_write,      CMD_DESC("<data>")},
    { "help",       btcli_spps_help,       CMD_DESC(CMD_HELP_DESC)},
};

/* btcli spps help */
static enum cmd_status btcli_spps_help(char *cmd)
{
	return cmd_help_exec(spps_cmds, cmd_nitems(spps_cmds), 10);
}

enum cmd_status btcli_spps(char *cmd)
{
    return cmd_exec(cmd, spps_cmds, cmd_nitems(spps_cmds));
}
```

##### 初始化

1. 总回调结构体是 btmg_callback_t，设置 spp server 的回调函数；
2. 调用 btmg_core_init 初始化 bt_manager;
3. 调用 btmg_register_callback 注册步骤 1 设置好的回调函数；
4. 调用 btmg_set_profile(BTMG_SPP_SERVER) 使能蓝牙 Profile；
5. 调用 btmg_adapter_enable(true) 使能蓝牙；
6. 蓝牙使能成功后触发 state_cb，参考 btcli_adapter_status_cb；
7. 在 state_cb 中调用 btmg_adapter_set_name，设置蓝牙名称；
8. 在 state_cb 中调用 btmg_adapter_set_io_capability，设置 io_capability 能力；
9. 在 state_cb 中调用 btmg_adapter_set_scanmode，设置发现模式；
10. 在 state_cb 中调用 btmg_spps_start 指定 Channel 把 SPP Server 真正启动起来。

##### 连接

完成以上初始化后，手机等 SPP Client 设备可以搜索并发起连接。连接状态可以通过btmg_spps_cb.conn_state_cb 获取。

如需主动断开，请使用 btmg_spps_disconnect 接口。

##### 数据收发

设备连接成功后，可进行数据发送和接收：

1. 通过 btmg_spps_write 发送数据；
2. 通过 btmg_spps_cb.recvdata_cb 回调接收对方数据；

##### 反初始化

反初始化参考 btcli_deinit，主要是以下函数：

```
btmg_adapter_enable(false);
btmg_core_deinit();
btmg_unregister_callback(void);
```

需要注意对于 SPP Server，需要先调用 btmg_spps_stop 再进行反初始化，否则下一次启动 SPP Server 会有异常和内存泄漏。

## BLE 开发介绍

BLE 根据交互行为划分为 Central 与 Peripheral 两个角色，可以理解为客户端‑服务端结构。

- Central （中心设备）：作为客户端，一般需要配合 BLE 扫描，主动连上 Perpheral 设备，进行数据交互。从蓝牙 Profile 的角度称为 GATT Client。例如：手机一般会作为 Central 设备使用。
- Peripheral（外围设备）：作为服务端，一般需要向外广播数据包，让 Central 可以扫描到。它包含一个或者多个 Service，从蓝牙 Profile 的角度称为 GATT Server。例如: 设备使用 BLE 配网作为 Peripheral 设备。

### BLE 基础功能

GATT Server 和 GATT Client 的开发基于 BLE 的基础 API，比如扫描、连接、广播等功能。设备建立起连接后才能通过 GATT 数据交互。本文档为了方便开发者了解在开发 GATT Server 或者 GATTClient 过程中可能会使用到哪些 BLE 基础 API，会将 BLE 基础 API 的说明附加在具体的功能 API 说明中。

###  GATT Server 

#### GATT Server API

列出开发 GATT Server 功能所需的 API，包含 BLE 基础接口

| API 接口                       | 说明                                                         |
| ------------------------------ | ------------------------------------------------------------ |
| btmg_gatt_attr_create          | 创建 GATT Database                                           |
| btmg_gatt_attr_destory         | 销毁 GATT Database                                           |
| btmg_gatt_attr_primary_service | 往 Database 中添加 service                                   |
| btmg_gatt_attr_characteristic  | 往 Database 中添加 characteristic                            |
| btmg_gatt_attr_ccc             | 往 Database 中添加 ccc                                       |
| btmg_gatt_register_service     | 把构建好的 service 注册到协议栈                              |
| btmg_gatt_unregister_service   | 注销已注册的 service                                         |
| btmg_gatt_get_db               | 遍历本地的 Database                                          |
| btmg_gatts_notify              | 发送 notify                                                  |
| btmg_gatts_indicate            | 发送 indicate                                                |
| btmg_le_set_name               | 设置本地 ble 名字                                            |
| btmg_le_get_name               | 获取本地 ble 名字                                            |
| btmg_le_enable_adv             | 打开或者关闭广播；打开广播之前先设置广播的参数和内容         |
| btmg_le_set_adv_param          | 设置广播参数，如广播的间隔，广播的类型等                     |
| btmg_le_set_adv_scan_rsp_data  | 设置广播数据内容：例如 UUID、BLE 设备名称等；设置扫描响应数据 |
| btmg_le_whitelist_add          | 添加白名单，注意白名单保存在 controller 中；通过白名单，可以只允许特定的蓝牙设备（白名单中列出的）扫描（Scan）、连接（connect） |
| btmg_le_white_list_remove      | 将指定设备从 controller 中的白名单中清除                     |
| btmg_le_whitelist_clear        | 将 controller 中的白名单清空                                 |
| btmg_le_get_connected_num      | 获取已连接设备数量                                           |
| btmg_le_get_connected_list     | 获取已连接设备列表                                           |

#### GATT Server API 调用流程

GATT Server 功能的使用示例

```c
#include "cmd_util.h"
#include "ctype.h"
#include <bt_manager.h>

static enum cmd_status btcli_ble_help(char *cmd);

#define REASON_TO_STR(def)                                                                         \
    case BTMG_BLE_##def:                                                                           \
        return #def

static inline char *btcli_le_disconect_reason_to_str(gattc_disconnect_reason_t reason)
{
    switch (reason) {
        REASON_TO_STR(STATUS_CODE_SUCCESS);
        REASON_TO_STR(AUTHENTICATION_FAILURE);
        REASON_TO_STR(CONNECTION_TIMEOUT);
        REASON_TO_STR(REMOTE_USER_TERMINATED);
        REASON_TO_STR(LOCAL_HOST_TERMINATED);
        REASON_TO_STR(LMP_RESPONSE_TIMEOUT);
        REASON_TO_STR(FAILED_TO_BE_ESTABLISHED);
        REASON_TO_STR(UNKNOWN_OTHER_ERROR);
    default:
        return "UNKNOWN_OTHER_ERROR";
    }
}

static int btcli_addr_from_str(const char *str, btmg_addr_t *addr)
{
    int i, j;
    uint8_t tmp;

    if (strlen(str) != 17U) {
        return -1;
    }
    for (i = 5, j = 1; *str != '\0'; str++, j++) {
        if (!(j % 3) && (*str != ':')) {
            return -1;
        } else if (*str == ':') {
            i--;
            continue;
        }
        addr->val[6 - i] = addr->val[6 - i] << 4;
        if (char2hex(*str, &tmp) < 0) {
            return -1;
        }
        addr->val[6 - i] |= tmp;
    }
    return 0;
}

static int btcli_le_addr_from_str(const char *str, const char *type, btmg_le_addr_t *addr)
{
    int err;

    err = btcli_addr_from_str(str, &addr->addr);
    if (err < 0) {
        return err;
    }

    if (!strcmp(type, "public") || !strcmp(type, "(public)")) {
        addr->type = BTMG_LE_PUBLIC_ADDRESS;
    } else if (!strcmp(type, "random") || !strcmp(type, "(random)")) {
        addr->type = BTMG_LE_RANDOM_ADDRESS;
    } else if (!strcmp(type, "public-id") || !strcmp(type, "(public-id)")) {
        addr->type = BTMG_LE_PUBLIC_ADDRESS_ID;
    } else if (!strcmp(type, "random-id") || !strcmp(type, "(random-id)")) {
        addr->type = BTMG_LE_RANDOM_ADDRESS_ID;
    } else {
        return -1;
    }

    return 0;
}

static int btcli_le_addr_to_str(btmg_le_addr_t addr, char *str, int len)
{
    char type[10];

    switch (addr.type) {
    case BTMG_LE_RANDOM_ADDRESS:
        strcpy(type, "random");
        break;
    case BTMG_LE_PUBLIC_ADDRESS:
        strcpy(type, "public");
        break;
    case BTMG_LE_RANDOM_ADDRESS_ID:
        strcpy(type, "random-id");
        break;
    case BTMG_LE_PUBLIC_ADDRESS_ID:
        strcpy(type, "public-id");
        break;
    default:
        snprintk(type, sizeof(type), "0x%02x", addr.type);
        break;
    }

    return snprintk(str, len, "%02X:%02X:%02X:%02X:%02X:%02X (%s)", addr.addr.val[0],
                    addr.addr.val[1], addr.addr.val[2], addr.addr.val[3], addr.addr.val[4],
                    addr.addr.val[5], type);
}

void btcli_ble_scan_cb(le_scan_cb_para_t *data)
{
    char addr[30];

    btcli_le_addr_to_str(data->addr, addr, sizeof(addr));
    CMD_DBG("[DEVICE]: %s, AD evt type %u, RSSI %i %s\n", addr, data->adv_type, data->rssi, data->name);
}

void btcli_ble_connection_cb(le_connection_para_t *data)
{
    char addr[30];
    btcli_le_addr_to_str(data->addr, addr, 30);

    if (data->role == 0) {
        if (data->status == LE_CONNECTED) {
           CMD_DBG("gattc connect success,id=[%d] %s\n", data->conn_id, addr);
        } else if (data->status == LE_CONNECT_FAIL){
           CMD_DBG("gattc connect failed,id=[%d] %s\n", data->conn_id, addr);
        } else if (data->status == LE_DISCONNECTED) {
           CMD_DBG("gattc disconnected, reason= %s, id=[%d] %s\n",
                    btcli_le_disconect_reason_to_str(data->reason), data->conn_id, addr);
        }
    } else {
        if (data->status == LE_CONNECTED) {
           CMD_DBG("gatts connected,id=[%d] %s\n", data->conn_id, addr);
        } else if (data->status == LE_CONNECT_FAIL){
           CMD_DBG("gatts connect failed,id=[%d] %s\n", data->conn_id, addr);
        } else if (data->status == LE_DISCONNECTED) {
           CMD_DBG("gatts disconnected, reason[0x%02x]= %s, id=[%d] %s\n",
                    data->reason ,btcli_le_disconect_reason_to_str(data->reason), data->conn_id, addr);
        }
    }
}

enum cmd_status btcli_ble_scan(char *cmd)
{
    int argc;
    char *argv[5];
    int err;
    int i = 0;

    argc = cmd_parse_argv(cmd, argv, 5);
    if (argc < 1) {
        CMD_ERR("invalid param number %d\n", argc);
        return CMD_STATUS_INVALID_ARG;
    }

    btmg_le_scan_param_t scan_param = { 0 };
    {
        scan_param.scan_type = LE_SCAN_TYPE_ACTIVE;
        scan_param.scan_interval = 0x0320;
        scan_param.scan_window = 0x0190;
        scan_param.filter_duplicate = LE_SCAN_DUPLICATE_DISABLE;
        scan_param.filter_policy = LE_SCAN_FILTER_POLICY_ALLOW_ALL;
        scan_param.timeout = 0;
    }

    while (i < argc) {
        if (!cmd_strcmp(argv[i], "on")) {
            CMD_DBG("Use default scan parameters\n");
        } else if (!cmd_strcmp(argv[i], "off")) {
            err = btmg_le_scan_stop();
            if (err) {
                CMD_ERR("LE scan stop failed\n");
                return err;
            } else {
                CMD_DBG("LE scan stopped successfully\n");
            }
            return CMD_STATUS_OK;
        } else if (!cmd_strcmp(argv[i], "passive")) {
            scan_param.scan_type = LE_SCAN_TYPE_PASSIVE;
        } else if (!cmd_strcmp(argv[i], "dups")) {
            scan_param.filter_duplicate = LE_SCAN_DUPLICATE_DISABLE;
        } else if (!cmd_strcmp(argv[i], "nodups")) {
            scan_param.filter_duplicate = LE_SCAN_DUPLICATE_ENABLE;
        } else if (!cmd_strcmp(argv[i], "wl")) {
            scan_param.filter_policy = LE_SCAN_FILTER_POLICY_ONLY_WLIST;
        } else if (!cmd_strcmp(argv[i], "active")) {
            scan_param.scan_type = LE_SCAN_TYPE_ACTIVE;
        } else if (!cmd_strcmp(argv[i], "timeout")) {
            scan_param.timeout = strtoul(argv[i], NULL, 16);
        } else if (!cmd_strncmp(argv[i], "int=0x", 4)) {
            uint32_t num;
            int cnt = cmd_sscanf(argv[i] + 4, "%x", &num);
            if (cnt != 1) {
                CMD_ERR("invalid param %s\n", argv[i] + 4);
                return CMD_STATUS_INVALID_ARG;
            }
            scan_param.scan_interval = num;
            CMD_DBG("scan interval 0x%x\n", scan_param.scan_interval);
        } else if (!cmd_strncmp(argv[i], "win=0x", 4)) {
            uint32_t num;
            int cnt = cmd_sscanf(argv[i] + 4, "%x", &num);
            if (cnt != 1) {
                CMD_ERR("invalid param %s\n", argv[i] + 4);
                return CMD_STATUS_INVALID_ARG;
            }
            scan_param.scan_window = num;
            CMD_DBG("scan window 0x%x\n", scan_param.scan_window);
        } else {
            CMD_ERR("invalid param %s\n", argv[i]);
            return CMD_STATUS_INVALID_ARG;
        }
        i++;
    }
    err = btmg_le_scan_start(&scan_param);
    if (err) {
        CMD_ERR("LE scan start failed\n");
        return err;
    } else {
        CMD_DBG("LE scan started!\n");
    }

    return CMD_STATUS_OK;
}

enum cmd_status btcli_ble_adv(char *cmd)
{
    int argc;
    char *argv[5];
    int i = 0;
    int err;
    int start_adv = 0;
    btmg_adv_scan_rsp_data_t btmg_adv_data = { 0 };
    btmg_adv_scan_rsp_data_t btmg_scan_data = { 0 };

    argc = cmd_parse_argv(cmd, argv, 5);
    if (argc < 1) {
        CMD_ERR("invalid param number %d\n", argc);
        return CMD_STATUS_INVALID_ARG;
    }

    while (i < argc) {
        if (!cmd_strcmp(argv[i], "on")) {
            start_adv = 1;
        } else if (!cmd_strcmp(argv[i], "off")) {
            err = btmg_le_enable_adv(0);
            if (err) {
                CMD_ERR("Disable Advertising failed,(err %d)\n");
                return err;
            } else {
                CMD_DBG("Advertising stopped\n");
            }
            return 0;
        } else if (!cmd_strncmp(argv[i], "adv=", 4)) {
            btmg_adv_data.data_len = hex2bin(argv[i] + 4, strlen(argv[i]) - 4, btmg_adv_data.data,
                                             sizeof(btmg_adv_data.data));
            if (btmg_adv_data.data_len == 0) {
                CMD_ERR("No data set\n");
                return CMD_STATUS_INVALID_ARG;
            }
        } else if (!cmd_strncmp(argv[i], "scan=", 5)) {
            btmg_scan_data.data_len = hex2bin(argv[i] + 5, strlen(argv[i]) - 5, btmg_scan_data.data,
                                              sizeof(btmg_scan_data.data));
            if (btmg_scan_data.data_len == 0) {
                CMD_ERR("No data set\n");
                return CMD_STATUS_INVALID_ARG;
            }
        }
        i++;
    }
    btmg_le_set_adv_scan_rsp_data(&btmg_adv_data, &btmg_scan_data);
    if (start_adv = 1) {
        btmg_le_set_adv_param(NULL);
        err = btmg_le_enable_adv(true);
        CMD_DBG("Advertising started\n");
    }

    return CMD_STATUS_OK;
}

enum cmd_status btcli_ble_name(char *cmd)
{
    int argc;
    char *argv[1];
    int err;

    argc = cmd_parse_argv(cmd, argv, 1);

    if (argc < 1) {
        CMD_DBG("Bluetooth Local ble Name: %s\n", btmg_le_get_name());
        return CMD_STATUS_OK;
    }

    err = btmg_le_set_name(argv[0]);
    if (err) {
        CMD_DBG("Unable to set ble name %s (err %d)\n", argv[0], err);
        return CMD_STATUS_FAIL;
    }
    return CMD_STATUS_OK;
}

enum cmd_status btcli_ble_connect(char *cmd)
{
    int argc;
    char *argv[5];
    int err;
    bt_addr_le_t addr;

    argc = cmd_parse_argv(cmd, argv, 5);
    if (argc < 1) {
        CMD_ERR("invalid param number %d\n", argc);
        return CMD_STATUS_INVALID_ARG;
    }

    err = bt_addr_le_from_str(argv[0], argv[1], &addr);
    if (err) {
        CMD_ERR("Invalid peer address (err %d)\n", err);
        return CMD_STATUS_INVALID_ARG;
    }

    btmg_le_addr_t peer;
    peer.type = BTMG_LE_RANDOM_ADDRESS;

    btmg_le_conn_param_t conn_param;
    conn_param.min_conn_interval = 0x0010;
    conn_param.max_conn_interval = 0x0020;
    conn_param.slave_latency = 0x0000;
    conn_param.conn_sup_timeout = 0x0050;
    memcpy(peer.addr.val, addr.a.val, 6);

    if (addr.type == BT_ADDR_LE_PUBLIC) {
        peer.type = BTMG_LE_PUBLIC_ADDRESS;
    } else if (addr.type == BT_ADDR_LE_RANDOM) {
        peer.type = BTMG_LE_RANDOM_ADDRESS;
    } else {
        return CMD_STATUS_INVALID_ARG;
    }

    int i = 2;
    while (i < argc) {
        if (!cmd_strncmp(argv[i], "lat=", 4)) {
            uint32_t num;
            int cnt = cmd_sscanf(argv[i] + 4, "%x", &num);
            if (cnt != 1) {
                CMD_ERR("invalid param %s\n", argv[i] + 4);
                return CMD_STATUS_INVALID_ARG;
            }
            conn_param.slave_latency = (uint16_t)(num);
            CMD_DBG("conn latency 0x%x\n", conn_param.slave_latency);
        } else if (!cmd_strncmp(argv[i], "to=", 3)) {
            uint32_t num;
            int cnt = cmd_sscanf(argv[i] + 3, "%x", &num);
            if (cnt != 1) {
                CMD_ERR("invalid param %s\n", argv[i] + 4);
                return CMD_STATUS_INVALID_ARG;
            }
            conn_param.conn_sup_timeout = (uint16_t)(num);
            CMD_DBG("conn timeout 0x%x\n", conn_param.conn_sup_timeout);
        } else if (!cmd_strncmp(argv[i], "min=", 4)) {
            uint32_t num;
            int cnt = cmd_sscanf(argv[i] + 4, "%x", &num);
            if (cnt != 1) {
                CMD_ERR("invalid param %s\n", argv[i] + 4);
                return CMD_STATUS_INVALID_ARG;
            }
            conn_param.min_conn_interval = (uint16_t)(num);
            CMD_DBG("conn interval_min 0x%x\n", conn_param.min_conn_interval);
        } else if (!cmd_strncmp(argv[i], "max=", 4)) {
            uint32_t num;
            int cnt = cmd_sscanf(argv[i] + 4, "%x", &num);
            if (cnt != 1) {
                CMD_ERR("invalid param %s\n", argv[i] + 4);
                return CMD_STATUS_INVALID_ARG;
            }
            conn_param.max_conn_interval = (uint16_t)(num);
            CMD_DBG("conn interval_max 0x%x\n", conn_param.max_conn_interval);
        } else {
            CMD_ERR("invalid param %s\n", argv[i]);
            return CMD_STATUS_INVALID_ARG;
        }
        i++;
    }
    err = btmg_le_connect(&peer, &conn_param);
    if (err) {
        CMD_ERR("ble connect failed\n");
        return -1;
    }

    return CMD_STATUS_OK;
}

enum cmd_status btcli_ble_disconnect(char *cmd)
{
    int argc;
    char *argv[3];
    int err;
    uint8_t default_conn_id = 0;

    argc = cmd_parse_argv(cmd, argv, 3);

    if (default_conn_id >= 0 && argc < 3) {
        err = btmg_le_disconnect(default_conn_id, 0);
    } else {
        // bt_addr_le_t addr;
        // if (argc < 3) {
        //     shell_help(shell);
        //     return SHELL_CMD_HELP_PRINTED;
        // }
        // err = bt_addr_le_from_str(argv[1], argv[2], &addr);
        // if (err) {
        //     shell_error(shell, "Invalid peer address (err %d)", err);
        //     return err;
        // }
        // err = btmg_le_disconnect(0, 0);
    }
    return CMD_STATUS_OK;
}

enum cmd_status btcli_ble_connections(char *cmd)
{

    char addr[30];
    int dev_num = 0;

    btmg_le_get_connected_num(&dev_num);
    gattc_connected_list_para_t param[dev_num];
    btmg_le_get_connected_list(param);

    for (int i = 0; i < dev_num; i++) {
        btcli_le_addr_to_str(param[i].addr, addr, 30);
        CMD_DBG("DEVICE[%s],conn_id[%d]\n", addr, param[i].conn_id);
    }
    return CMD_STATUS_OK;
}

#if defined(CONFIG_BT_WHITELIST)
enum cmd_status btcli_ble_wl_add(char *cmd)
{
    int argc;
    char *argv[2];
    int err;
    btmg_le_addr_t addr;

    argc = cmd_parse_argv(cmd, argv, 2);
    if (argc < 1) {
        CMD_ERR("invalid param number %d\n", argc);
        return CMD_STATUS_INVALID_ARG;
    }

    err = btcli_le_addr_from_str(argv[0], argv[1], &addr);
    if (err) {
        CMD_ERR("Invalid peer address (err %d)\n", err);
        return CMD_STATUS_INVALID_ARG;
    }

    err = btmg_le_whitelist_add(&addr);
    if (err) {
        CMD_ERR("Add to whitelist failed (err %d)\n", err);
        return CMD_STATUS_INVALID_ARG;
    }

    return CMD_STATUS_OK;
}

enum cmd_status btcli_ble_wl_rem(char *cmd)
{
    int argc;
    char *argv[2];
    int err;
    btmg_le_addr_t addr;

    argc = cmd_parse_argv(cmd, argv, 2);
    if (argc < 1) {
        CMD_ERR("invalid param number %d\n", argc);
        return CMD_STATUS_INVALID_ARG;
    }

    err = btcli_le_addr_from_str(argv[0], argv[1], &addr);
    if (err) {
        CMD_ERR("Invalid peer address (err %d)\n", err);
        return CMD_STATUS_INVALID_ARG;
    }

    err = btmg_le_white_list_remove(&addr);
    if (err) {
        CMD_ERR("Remove from whitelist failed (err %d)\n", err);
        return CMD_STATUS_INVALID_ARG;
    }

    return CMD_STATUS_OK;
}

enum cmd_status btcli_ble_wl_clear(char *cmd)
{
    int err;

    err = btmg_le_whitelist_clear();
    if (err) {
        CMD_ERR("Clearing whitelist failed (err %d)\n", err);
        return CMD_STATUS_FAIL;
    }

    return CMD_STATUS_OK;
}

enum cmd_status blecli_ble_wl_connect(char *cmd)
{
    int argc;
    char *argv[1];
    int err;
    btmg_le_conn_param_t conn_param;

    argc = cmd_parse_argv(cmd, argv, 1);
    if (argc < 1) {
        CMD_ERR("invalid param number %d\n", argc);
        return CMD_STATUS_INVALID_ARG;
    }

    conn_param.min_conn_interval = 0x0018;
    conn_param.max_conn_interval = 0x0028;
    conn_param.slave_latency = 0;
    conn_param.conn_sup_timeout = 400;

    if (!strcmp(argv[0], "on")) {
        err = btmg_le_connect_auto_start(&conn_param);
        if (err) {
            CMD_ERR("Auto connect failed (err %d)\n", err);
            return CMD_STATUS_OK;
        }
    } else if (!strcmp(argv[0], "off")) {
        err = btmg_le_connect_auto_stop();
        if (err) {
            CMD_ERR("Auto connect stop failed (err %d)\n", err);
            return CMD_STATUS_OK;
        }
    }

    return CMD_STATUS_OK;
}
#else //!defined(CONFIG_BT_WHITELIST)
enum cmd_status btcli_ble_auto_conn(char *cmd)
{
    int argc;
    char *argv[3];
    int err;
    btmg_le_addr_t addr;
    btmg_le_conn_param_t conn_param;

    argc = cmd_parse_argv(cmd, argv, 3);
    if (argc < 1) {
        CMD_ERR("invalid param number %d\n", argc);
        return CMD_STATUS_INVALID_ARG;
    }

    conn_param.min_conn_interval = 0x0018;
    conn_param.max_conn_interval = 0x0028;
    conn_param.slave_latency = 0;
    conn_param.conn_sup_timeout = 400;

    err = btmg_addr_le_from_str(argv[0], argv[1], &addr);
    if (err) {
        CMD_ERR("Invalid peer address (err %d)\n", err);
        return CMD_STATUS_INVALID_ARG;
    }

    if (argc < 4) {
        return btmg_le_set_auto_connect(&addr, &conn_param);
    } else if (!strcmp(argv[2], "on")) {
        return btmg_le_set_auto_connect(&addr, &conn_param);
    } else if (!strcmp(argv[2], "off")) {
        return btmg_le_set_auto_connect(&addr, NULL);
    }
}
#endif

#if defined(CONFIG_BT_SMP) || defined(CONFIG_BT_BREDR)
enum cmd_status btcli_ble_get_sec(char *cmd)
{
    int argc;
    char *argv[1];
    int conn_id = 0;

    argc = cmd_parse_argv(cmd, argv, 1);
    if (argc < 1) {
        CMD_ERR("invalid param number %d\n", argc);
        return CMD_STATUS_INVALID_ARG;
    }

    conn_id = strtoul(argv[0], NULL, 16);

    int sec = btmg_le_get_security(conn_id);
    CMD_ERR("conn_id=%d, security=%d\n", conn_id, sec);

    return CMD_STATUS_OK;
}

enum cmd_status btcli_ble_set_sec(char *cmd)
{
    int argc;
    char *argv[2];
    int sec, ret, conn_id = 0;

    argc = cmd_parse_argv(cmd, argv, 2);
    if (argc < 1) {
        CMD_ERR("invalid param number %d\n", argc);
        return CMD_STATUS_INVALID_ARG;
    }

    sec = strtoul(argv[0], NULL, 16);
    if (argc == 2) {
        conn_id = strtoul(argv[1], NULL, 16);
    }
    ret = btmg_le_set_security(conn_id, sec);
    if (ret) {
        CMD_ERR("conn_id=%d, security=%d failed\n", conn_id, sec);
        return CMD_STATUS_OK;
    }
    CMD_ERR("conn_id=%d, security=%d success\n", conn_id, sec);

    return CMD_STATUS_OK;
}
#endif

static const struct cmd_data ble_cmds[] = {
    { "scan",           btcli_ble_scan,          CMD_DESC("<on/off/passive> [int=0x0100] [win=0x0100] [silent]")},
    { "adv",            btcli_ble_adv,           CMD_DESC("<on/off> [adv=020106] [scan=]")},
    { "name",           btcli_ble_name,          CMD_DESC("[name]")},
    { "connect",        btcli_ble_connect,       CMD_DESC("<address: XX:XX:XX:XX:XX:XX> <type: (public|random)> [min=] [max=] [to=]")},
    { "disconnect",     btcli_ble_disconnect,    CMD_DESC("[none]")},
    { "connections",    btcli_ble_connections,   CMD_DESC("[none]")},
#if defined(CONFIG_BT_WHITELIST)
    { "wl_add",         btcli_ble_wl_add,        CMD_DESC("<address: XX:XX:XX:XX:XX:XX> <type: (public|random)>")},
    { "wl_rem",         btcli_ble_wl_rem,        CMD_DESC("<address: XX:XX:XX:XX:XX:XX> <type: (public|random)>")},
    { "wl_clear",       btcli_ble_wl_clear,      CMD_DESC("[none]")},
    { "wl_connect",     btcli_ble_connect,       CMD_DESC("<on, off>")},
#else
    { "auto_conn",      btcli_ble_auto_conn,     CMD_DESC("<address: XX:XX:XX:XX:XX:XX> <type: (public|random)> [value:on,off]")},
#endif
#if defined(CONFIG_BT_SMP) || defined(CONFIG_BT_BREDR)
    { "get_sec",        btcli_ble_get_sec,       CMD_DESC("[conn_id]")},
    { "set_sec",        btcli_ble_set_sec,       CMD_DESC("<security level: >=1 > [conn_id]")},
#endif
    { "help",           btcli_ble_help,          CMD_DESC(CMD_HELP_DESC)},
};

/* btcli ble help */
static enum cmd_status btcli_ble_help(char *cmd)
{
	return cmd_help_exec(ble_cmds, cmd_nitems(ble_cmds), 10);
}

enum cmd_status btcli_ble(char *cmd)
{
    return cmd_exec(cmd, ble_cmds, cmd_nitems(ble_cmds));
}

#include "cmd_util.h"
#include "ctype.h"
#include <bt_manager.h>

static enum cmd_status btcli_gatt_help(char *cmd);

static void btcli_print_chrc_props(uint8_t properties)
{
    printf("Properties: ");
    if (properties & BT_GATT_CHRC_BROADCAST) {
        printf("[bcast] ");
    }
    if (properties & BT_GATT_CHRC_READ) {
        printf("[read] ");
    }
    if (properties & BT_GATT_CHRC_WRITE) {
        printf("[write] ");
    }
    if (properties & BT_GATT_CHRC_WRITE_WITHOUT_RESP) {
        printf("[write without rsp] ");
    }
    if (properties & BT_GATT_CHRC_NOTIFY) {
        printf("[notify] ");
    }
    if (properties & BT_GATT_CHRC_INDICATE) {
        printf("[indicate] ");
    }
    if (properties & BT_GATT_CHRC_AUTH) {
        printf("[auth] ");
    }
    if (properties & BT_GATT_CHRC_EXT_PROP) {
        printf("[ext prop] ");
    }
    printf("\n");
}

static void btcli_uuid_to_str(btmg_uuid_t *uuid, char *str, size_t len)
{
    uint32_t tmp1, tmp5;
    uint16_t tmp0, tmp2, tmp3, tmp4;

    switch (uuid->type) {
    case BTMG_UUID_16:
        snprintk(str, len, "%04x", uuid->value.u16);
        break;
    case BTMG_UUID_32:
        snprintk(str, len, "%08x", uuid->value.u32);
        break;
    case BTMG_UUID_128:
        memcpy(&tmp0, &uuid->value.u128[0], sizeof(tmp0));
        memcpy(&tmp1, &uuid->value.u128[2], sizeof(tmp1));
        memcpy(&tmp2, &uuid->value.u128[6], sizeof(tmp2));
        memcpy(&tmp3, &uuid->value.u128[8], sizeof(tmp3));
        memcpy(&tmp4, &uuid->value.u128[10], sizeof(tmp4));
        memcpy(&tmp5, &uuid->value.u128[12], sizeof(tmp5));

        snprintk(str, len, "%08x-%04x-%04x-%04x-%08x%04x", tmp5, tmp4, tmp3, tmp2, tmp1, tmp0);
        break;
    default:
        memset(str, 0, len);
        return;
    }
}

void btcli_gattc_dis_att_cb(gattc_dis_cb_para_t *data)
{
    char uuid_str1[37];
    char uuid_str2[37];

    switch (data->type) {
    case BTMG_DIS_PRIMARY_SERVER:
    case BTMG_DIS_SECONDARY_SERVER:
    case BTMG_DIS_INCLUDE_SERVER:
        btcli_uuid_to_str(&(data->uuid), uuid_str1, sizeof(uuid_str1));
        btcli_uuid_to_str(&(data->server_uuid), uuid_str2, sizeof(uuid_str2));
        printf("start_handle [0x%04x]------------end_handle [0x%04x]\n",
                                    data->start_handle, data->end_handle);
        printf("-------|--------------------------------------------\n");
        printf("0x%04x | Service declaration[%s] | %s\n", data->start_handle, uuid_str1,
            data->type == BTMG_DIS_PRIMARY_SERVER ? "PRIMARY_SERVER" : "SECONDARY_SERVER");
        printf("0x%04x | Service uuid[%s]        | %s\n", data->start_handle+1, uuid_str2,
                !strcmp(uuid_str2, "1800") ?"Generic Access" :
                (!strcmp(uuid_str2, "1801")? "Generic Attribute": "Unknow Service"));
        printf("----------------------------------------------------\n");
        break;
    case BTMG_DIS_CHARACTERISTIC:
        btcli_uuid_to_str(&(data->uuid), uuid_str1, sizeof(uuid_str1));
        btcli_uuid_to_str(&(data->char_uuid), uuid_str2, sizeof(uuid_str2));
        printf("-------|--------------------------------------------\n");
        printf("0x%04x | Characteristic declaration[%s]\n", data->char_handle, uuid_str1);
        printf("0x%04x | Characteristic [%s]\n", data->value_handle, uuid_str2);
        if (data->properties & BT_GATT_CHRC_NOTIFY | data->properties & BT_GATT_CHRC_INDICATE) {
            printf("0x%04x | CCCD[2902]\n", data->value_handle+1);
        }
        btcli_print_chrc_props(data->properties);
        break;
    case BTMG_DIS_ATTRIBUTE:
        btcli_uuid_to_str(&(data->uuid), uuid_str1, sizeof(uuid_str1));
        printf("-------|--------------------------------------------\n");
        printf("0x%04x | Attribute uuid [%s]\n", data->attr_handle, uuid_str1);
        break;
    default:
        break;
    }
}

void btcli_gattc_notify_indicate_cb(gattc_notify_indicate_cb_para_t *data)
{
    char recv_data[data->length + 1];
    memcpy(recv_data, data->value, data->length);
    recv_data[data->length] = '\0';

    CMD_DBG("subscribe recv [handle=0x%04X][len=%d][data:%s]\n", data->value_handle,
              data->length, recv_data);
}

void btcli_gattc_read_cb(gattc_read_cb_para_t *data)
{
    int i;

    if (!data->success) {
        CMD_DBG("gattc read failed:(0x%02x),handle[0x%04x]\n", data->att_ecode, data->handle);
        return;
    }

    printf("\ngattc read handle[0x%04x],", data->handle);

    if (data->length == 0) {
        CMD_DBG(": 0 bytes\n");
        return;
    }

    printf(" [len=%d],value: ", data->length);

    for (i = 0; i < data->length; i++)
        printf("%02x ", data->value[i]);

    printf("\n");
}

void btcli_gattc_write_cb(gattc_write_cb_para_t *data)
{
    if (data->success) {
        CMD_DBG("gattc write OK,handle[0x%04x]\n", data->handle);
    } else {
        CMD_DBG("gattc write failed:(0x%02x), handle[0x%04x]\n", data->att_ecode, data->handle);
    }
}

void btcli_gatts_get_db_cb(gatts_get_db_t *data)
{
    char str[37];
    char str2[37];

    btcli_uuid_to_str(&(data->uuid), str, sizeof(str));
    btcli_uuid_to_str(&(data->uuid_value), str2, sizeof(str2));
    printf("[handle=0x%04X],[uuid=%s][uuid2=%s][perm=%d]\n", data->attr_handle, str, str2,
              data->perm);
}

void btcli_gatts_char_read_req_cb(gatts_char_read_req_t *data)
{
    char readdata[] = "read request received";

    memcpy(data->out_data, readdata, sizeof(readdata));
    data->out_len = sizeof(readdata);
    CMD_DBG("receive char read: [conn_id=%d][handle=0x%04X],[data:%s]\n", data->conn_id, data->attr_handle, readdata);
}

void btcli_gatts_char_write_req_cb(gatts_char_write_req_t *data)
{
    char recv_data[data->value_len + 1];
    memcpy(recv_data, data->value, data->value_len);
    recv_data[data->value_len] = '\0';

    CMD_DBG("receive char write: [conn_id=%d][handle=0x%04X][len=%d][value=%s]\n", data->conn_id,
              data->attr_handle, data->value_len,  recv_data);
}

void btcli_gatts_ccc_cfg_cb(gatts_ccc_cfg_t *data)
{
    if (data->value == 0) {
        CMD_DBG("Notifications and indications disabled, characteristics handle:%#x\n", data->attr_handle);
    } else if (data->value == 1) {
        CMD_DBG("Notifications enabled, characteristics handle:%#x\n", data->attr_handle);
    } else if (data->value == 2) {
        CMD_DBG("Indications enabled, characteristics handle:%#x\n", data->attr_handle);
    }
}

enum cmd_status btcli_gattc_discover(char *cmd)
{
    int argc;
    char *argv[2];
    uint8_t conn_id = 0;
    btmg_uuid_t *uuid = NULL;
    int dis_tpye = 0;
    uint16_t start_handle = 0x0001;
    uint16_t end_handle = 0xFFFF;

    argc = cmd_parse_argv(cmd, argv, 2);
    if (argc < 1) {
        CMD_ERR("invalid param number %d\n", argc);
        return CMD_STATUS_INVALID_ARG;
    }

    if (!cmd_strcmp(argv[0], "service")) {
            dis_tpye = 1;
    } else if (!cmd_strcmp(argv[0], "char")) {
            dis_tpye = 2;
    } else if (!cmd_strcmp(argv[0], "desc")) {
            dis_tpye = 3;
    }

    if (argc == 2) {
        conn_id = strtoul(argv[1], NULL, 16);
    }

    if (dis_tpye == 0) {
        btmg_gattc_discover_all_services(conn_id, uuid, start_handle, end_handle);
    } else if (dis_tpye == 1) {
        btmg_gattc_discover_primary_services(conn_id, uuid, start_handle, end_handle);
    } else if (dis_tpye == 2) {
        btmg_gattc_discover_characteristic(conn_id);
    } else if (dis_tpye == 3) {
        btmg_gattc_discover_descriptor(conn_id);
    }

    return CMD_STATUS_OK;
}

enum cmd_status btcli_gattc_write(char *cmd)
{
    int argc;
    char *argv[4];
    int err;
    uint16_t handle, conn_id = 0;
    size_t len = 0;
    uint8_t gatt_write_buf[512] = { 0 };

    argc = cmd_parse_argv(cmd, argv, 4);
    if (argc < 1) {
        CMD_ERR("invalid param number %d\n", argc);
        return CMD_STATUS_INVALID_ARG;
    }

    handle = strtoul(argv[0], NULL, 16);

    if (argc > 2 && !cmd_strcmp(argv[2], "string")) {
        len = MIN(strlen(argv[1]), sizeof(gatt_write_buf));
        strncpy((char *)gatt_write_buf, argv[1], len);
    } else {
        len = hex2bin(argv[1], strlen(argv[1]), gatt_write_buf, sizeof(gatt_write_buf));
        if (len == 0) {
            CMD_ERR("No data set \n");
           return CMD_STATUS_INVALID_ARG;
        }
    }

    if (argc == 4) {
        conn_id = strtoul(argv[3], NULL, 16);
    }

    err = btmg_gattc_write(conn_id, handle, gatt_write_buf, len);

    if (err) {
        CMD_ERR("Write failed (err %d)\n", err);
    }

    return CMD_STATUS_OK;
}

enum cmd_status btcli_gattc_read(char *cmd)
{
    int argc;
    char *argv[2];
    int err;
    uint16_t handle, conn_id = 0;

    argc = cmd_parse_argv(cmd, argv, 2);
    if (argc < 1) {
        CMD_ERR("invalid param number %d\n", argc);
        return CMD_STATUS_INVALID_ARG;
    }

    handle = strtoul(argv[0], NULL, 16);

    if (argc == 2) {
        conn_id = strtoul(argv[1], NULL, 16);
    }

    err = btmg_gattc_read(conn_id, handle);

    if (err) {
        CMD_ERR("Read failed (err %d)\n", err);
    }

    return CMD_STATUS_OK;
}

enum cmd_status btcli_gattc_subscribe(char *cmd)
{
    int argc;
    char *argv[2];
    int err;
    uint16_t handle, conn_id = 0;
    bool is_indicate = false;

    argc = cmd_parse_argv(cmd, argv, 2);
    if (argc < 1) {
        CMD_ERR("invalid param number %d\n", argc);
        return CMD_STATUS_INVALID_ARG;
    }

    handle = strtoul(argv[0], NULL, 16);
    if (argc > 1) {
        conn_id = strtoul(argv[1], NULL, 16);
    }

    btmg_gattc_subscribe(conn_id, handle);

    return CMD_STATUS_OK;
}

enum cmd_status btcli_gattc_unsubscribe(char *cmd)
{
    int argc;
    char *argv[2];
    int err;
    uint16_t handle, conn_id = 0;

    argc = cmd_parse_argv(cmd, argv, 2);
    if (argc < 1) {
        CMD_ERR("invalid param number %d\n", argc);
        return CMD_STATUS_INVALID_ARG;
    }

    handle = strtoul(argv[0], NULL, 16);
    if (argc > 1) {
        conn_id = strtoul(argv[1], NULL, 16);
    }

    err = btmg_gattc_unsubscribe(conn_id, handle);

    return CMD_STATUS_OK;
}

enum cmd_status btcli_gatts_show_db(char *cmd)
{
    btmg_gatt_get_db();

    return CMD_STATUS_OK;
}

enum cmd_status btcli_gatts_notify(char *cmd)
{
    int argc;
    char *argv[4];
    int err;
    uint16_t handle, offset, conn_id = 0;
    size_t len = 0;
    uint8_t gatt_write_buf[1024] = { 0 };

    argc = cmd_parse_argv(cmd, argv, 4);
    if (argc < 1) {
        CMD_ERR("invalid param number %d\n", argc);
        return CMD_STATUS_INVALID_ARG;
    }

    handle = strtoul(argv[0], NULL, 16);

    if (argc >= 4 && !cmd_strcmp(argv[2], "string")) {
        len = MIN(strlen(argv[1]), sizeof(gatt_write_buf));
        strncpy((char *)gatt_write_buf, argv[1], len);
        if (argc == 4) {
            conn_id = strtoul(argv[3], NULL, 16);
        }
    } else {
        len = hex2bin(argv[1], strlen(argv[1]), gatt_write_buf, sizeof(gatt_write_buf));
        if (len == 0) {
            CMD_ERR("No data set\n");
            return CMD_STATUS_INVALID_ARG;
        }
        if (argc == 3) {
            conn_id = strtoul(argv[2], NULL, 16);
        }
    }
    btmg_gatts_notify(conn_id, handle, gatt_write_buf, len);

    return CMD_STATUS_OK;
}

enum cmd_status btcli_gatts_indicate(char *cmd)
{
    int argc;
    char *argv[4];
    int err;
    uint16_t handle, offset, conn_id = 0;
    size_t len = 0;
    uint8_t gatt_write_buf[1024] = { 0 };

    argc = cmd_parse_argv(cmd, argv, 4);
    if (argc < 1) {
        CMD_ERR("invalid param number %d\n", argc);
        return CMD_STATUS_INVALID_ARG;
    }

    handle = strtoul(argv[0], NULL, 16);

    if (argc >= 4 && !cmd_strcmp(argv[2], "string")) {
        len = MIN(strlen(argv[1]), sizeof(gatt_write_buf));
        strncpy((char *)gatt_write_buf, argv[1], len);
        conn_id = strtoul(argv[3], NULL, 16);
    } else {
        len = hex2bin(argv[1], strlen(argv[1]), gatt_write_buf, sizeof(gatt_write_buf));
        if (len == 0) {
            CMD_ERR("No data set\n");
            return CMD_STATUS_INVALID_ARG;
        }
        if (argc == 3) {
            conn_id = strtoul(argv[2], NULL, 16);
        }
    }

    btmg_gatts_notify(conn_id, handle, gatt_write_buf, len);

    return CMD_STATUS_OK;
}

enum cmd_status btcli_gatt_exchange_mtu(char *cmd)
{
    int argc;
    char *argv[1];
    int conn_id = 0;

    argc = cmd_parse_argv(cmd, argv, 1);
    if (argc == 1) {
        conn_id = atoi(argv[0]);
    }

    btmg_le_gatt_mtu_exchange(conn_id);
    CMD_DBG("conn %d mtu_exchange \n", conn_id);

    return CMD_STATUS_OK;
}

enum cmd_status btcli_gatt_get_mtu(char *cmd)
{
    int argc;
    char *argv[1];
    int mtu = 0;
    int conn_id = 0;

    argc = cmd_parse_argv(cmd, argv, 1);

    if (argc == 1) {
        conn_id = atoi(argv[0]);
    }

    mtu = btmg_le_conn_get_mtu(conn_id);
    CMD_DBG("Get conn:%d,MTU=%d\n", conn_id, mtu);

    return CMD_STATUS_OK;
}

static const struct cmd_data gatt_cmds[] = {
    { "discover",       btcli_gattc_discover,     CMD_DESC("[type: service, char, desc] [conn_id]")},
    { "write",          btcli_gattc_write,        CMD_DESC("<handle> <data> [string] [conn_id]")},
    { "read",           btcli_gattc_read,         CMD_DESC("<handle> [conn_id]")},
    { "subscribe",      btcli_gattc_subscribe,    CMD_DESC("<char_handle> [conn_id]")},
    { "unsubscribe",    btcli_gattc_unsubscribe,  CMD_DESC("<char_handle> [conn_id]")},
    { "show",           btcli_gatts_show_db,      CMD_DESC("[none]")},
    { "notify",         btcli_gatts_notify,       CMD_DESC("<handle> <data> [string] [conn_id]")},
    { "indicate",       btcli_gatts_indicate,     CMD_DESC("<handle> <data> [string] [conn_id]")},
    { "exchange_mtu",   btcli_gatt_exchange_mtu,  CMD_DESC("[conn_id]")},
    { "get_mtu",        btcli_gatt_get_mtu,       CMD_DESC("[conn_id]")},
    { "help",           btcli_gatt_help,          CMD_DESC(CMD_HELP_DESC)},
};

/* btcli gatt help */
static enum cmd_status btcli_gatt_help(char *cmd)
{
	return cmd_help_exec(gatt_cmds, cmd_nitems(gatt_cmds), 10);
}

enum cmd_status btcli_gatt(char *cmd)
{
    return cmd_exec(cmd, gatt_cmds, cmd_nitems(gatt_cmds));
}
```

##### 初始化

1. 总回调结构体是 btmg_callback_t，先设 gatt server 的回调函数；
2. 调用 btmg_core_init 初始化 btmanager;
3. 调用 btmg_register_callback 注册步骤 1 设置好的回调函数；
4. 调用 btmg_set_profile(BTMG_GATT_SERVER) 使能蓝牙 Profile；
5. 调用 btmg_adapter_enable(true) 使能蓝牙；
6. 蓝牙使能成功后触发 state_cb，可以获取蓝牙的开关状态；

##### 注册 service

正常打开蓝牙后，紧接着注册 service，可以参考 ble_gatt_register_service 的写法，大致步骤如下：

1. 通过 btmg_gatt_attr_create(int num_attr) 创建本地数据库，参数指支持的 attribute 最大数量；

2. 调用 btmg_gatt_attr_primary_service 创建一个 service；
3. 接着调用 btmg_gatt_attr_characteristic 添加 characteristic 到步骤 2 的 service 中；
4. 如 果 characteristic 需 要 添 加 Client Characteristic Configuration Descriptor， 就 在btmg_gatt_attr_characteristic 后面调用 btmg_gatt_attr_ccc；

5. 如果需要增加新的 service，调用需要再次 btmg_gatt_attr_primary_service，即btmg_gatt_attr_primary_service 函数是不同 service 的交界；

6. 在设置完所有需要添加的服务后，最后通过 btmg_gatt_register_service 注册到协议栈中；例如以下的写法，包含两个 service：

```c
db = btmg_gatt_attr_primary_service //service1 start
btmg_gatt_attr_characteristic
btmg_gatt_attr_ccc
btmg_gatt_attr_characteristic //service1 end
btmg_gatt_attr_primary_service //service2 start
btmg_gatt_attr_characteristic //service2 end
btmg_gatt_register_service(db)
```

##### 广播

打开广播可以参考 btcli.c 的 ble_advertise_on：

1. 调用 btmg_le_set_adv_param 配置广播参数，扫描参数请根据实际情况设置；
2. 调用 btmg_le_set_adv_scan_rsp_data 设置广播数据或扫描相应数据；
3. 调用 btmg_le_enable_adv(true) 开启广播；
4. 如需关闭广播调用 btmg_le_enable_adv(false);

##### 连接

GATT Server 设备在开启 BLE 广播后，可以被 GATT Client 设备扫描连接。连接状态通过 btmg_gatts_cb.conn_cb 上报。

可以参考 btcli_ble_connection_cb。

##### 数据交互

1. 收到对端设备的读请求，会触发 btmg_gatts_cb.char_read_req_cb 回调；
2. 收到对端设备的写请求，会触发 btmg_gatts_cb.char_write_req_cb 回调；
3. 收到对端设备对 ccc 的配置，会触发 btmg_gatts_cb.ccc_cfg_cb 回调；（1）对方配置使能 Indication 后，可以调用 btmg_gatts_indicate 发送指示；（2）对方配置使能 Notification 后，可以调用 btmg_gatts_notify 发送通知；

##### 反初始化

反初始化时，需要把已经注册的 service 注销、关闭广播、销毁前面创建的 Database：

```c
btmg_gatt_unregister_service
btmg_le_enable_adv(false);
btmg_gatt_attr_destory;
btmg_adapter_enable(false);
btmg_core_deinit();
btmg_unregister_callback(void);
```

### GATT Client

####  GATT Client API

列出开发 GATT Client 功能所需的 API，包含 BLE 基础接口

| API 接口                               | 说明                                                         |
| -------------------------------------- | ------------------------------------------------------------ |
| btmg_gattc_discover_all_services       | 从指定 handle 范围中发现所有 service 或指定UUID 服务；发现的结果通过btmg_gattc_cb.dis_att_cb 返回 |
| btmg_gattc_discover_primary_services   | 从指定 handle 范围中发现所有 primary service或指定 UUID 服务；发现的结果通过btmg_gattc_cb.dis_att_cb 返回 |
| btmg_gattc_discover_characteristic     | 发现所有 characteristic；发现的结果通过btmg_gattc_cb.dis_att_cb 返回 |
| btmg_gattc_discover_descriptor         | 发现所有 descriptor；发现的结果通过btmg_gattc_cb.dis_att_cb 返回 |
| btmg_gattc_read                        | 读取 GATT Server 的 Characteristic Value；读取结果通过 btmg_gattc_cb.read_cb 获取 |
| btmg_gattc_read_long                   | 如果 GATT Server 的 Characteristic Value 长度太长，可以通过此方法读取；读取结果通过btmg_gattc_cb.read_cb 获取 |
| btmg_gattc_write                       | 写数据到 GATT Server 的 Characteristic Value，Server 需要 response，response 通过btmg_gattc_cb.write_cb 上报 |
| btmg_gattc_write_long                  | 如果写入的数据太长，可以通过此函数，Server 也需要 response，response 通过 btmg_gattc_cb.write_cb 上报 |
| btmg_gattc_write_without_response      | 写数据到 GATT Server 的 Characteristic Value，Server 不需要 response |
| btmg_gattc_write_long_without_response | 如果写入的数据太长，可以通过此函数，Server 不需要 response   |
| btmg_gattc_subscribe                   | 注册 notify 或 indicate，协议栈底层已经包含写 CCC 的操作，注册完成后，Server 端才可以对 Client 通知或者指示 |
| btmg_gattc_unsubscribe                 | 注销 notify 或 indicate                                      |
| btmg_le_scan_start                     | 开始 BLE 扫描，扫描结果通过btmg_gattc_cb.le_scan_cb 上报     |
| btmg_le_scan_stop                      | 停止 BLE 扫描                                                |
| btmg_le_set_chan_map                   | 设置 channel map                                             |
| btmg_le_get_connected_num              | 获取已连接设备数量                                           |
| btmg_le_get_connected_list             | 获取已连接设备列表                                           |
| btmg_le_conn_param_update              | 更新 BLE 连接参数                                            |
| btmg_le_connect                        | 指定设备发起 BLE 连接                                        |
| btmg_le_disconnect                     | 断开 BLE 设备连接                                            |
| btmg_le_unpair                         | 取消 BLE 配对                                                |
| btmg_le_connect_auto_start             | 自动连接白名单中的对端 BLE 设备                              |
| btmg_le_connect_auto_stop              | 停止自动连接                                                 |
| btmg_le_set_auto_connect               | 自动连接到指定的对端 BLE 设备，启用此功能后，每次 BLE 设备断开与对端设备的连接时，若收到对端 BLE 设备的广播包，则将重新建立连接。在主动扫描期间需要禁止此功能 |
| btmg_le_get_security                   | 获取当前连接链路的安全等级                                   |
| btmg_le_set_security                   | 设置连接链路的安全等级                                       |
| btmg_le_smp_passkey_entry              | 输入 passkey 对配对绑定进行回复                              |
| btmg_le_smp_cancel                     | 取消正在进行的配对绑定流程                                   |
| btmg_le_smp_passkey_confirm            | 如果确认了 passkey 与用户匹配，则使用此函数进行回复          |
| btmg_le_smp_pairing_confirm            | 如果用户对配对绑定进行确认，则用此函数进行回复               |
| btmg_le_gatt_mtu_exchange              | 交换 MTU                                                     |
| btmg_le_conn_get_mtu                   | 获取当前连接协商后使用的 MTU 大小                            |

#### GATT Client API 调用流程

GATT Client 功能的使用示例

##### 初始化

1. 总回调结构体是 btmg_callback_t，先设 gatt client 的回调函数；
2. 调用 btmg_core_init 初始化 bt_manager;
3. 调用 btmg_register_callback 注册步骤 1 设置好的回调函数；
4. 调用 btmg_set_profile(BTMG_GATT_CLIENT) 使能蓝牙 Profile；
5. 调用 btmg_adapter_enable(true) 使能蓝牙；
6. 蓝牙使能成功后触发 state_cb，可以获取蓝牙的开关状态；
7. 可以根据需求使用 btmg_le_conn_param_update 更新连接参数；

##### 扫描连接

正常打开蓝牙后，可以扫描连接

1. 调用 btmg_le_scan_start 开始扫描；
2. 扫描到设备后，调用 btmg_le_scan_stop 停止扫描；
3. 获取到对方 mac 地址后，调用 btmg_le_connect 发起连接；
4. 支持连接多个设备，可以通过 btmg_le_get_connected_num和 btmg_le_get_connected_list 获取设备列表；

##### 数据通信

1. 可以使用 btmg_gattc_discover_primary_services 或者 btmg_gattc_discover_characteristic等接口获取 Server 端有哪些可以读写的 Characteristic Value；

2. 通过 btmg_gattc_read 或者 btmg_gattc_read_long 接口指定 Characteristic Value handle 读取 Characteristic Value；

3. 通过 btmg_gattc_write 或者 btmg_gattc_write_long 接口指定 Characteristic Value handle 写入 Characteristic Value；

4. 通过 btmg_gattc_subscribe 注册 notify 或 indicate，当收到 Server 的 notify 或 indicate，会通过 btmg_gattc_cb.notify_indicate_cb 上报；

## btcli 使用指南

### 命令简介

目前 RTOS 平台上 btmanager 的测试 demo 称为 btcli，支持 a2dp 、hfp、spp、gatt 等功能的测试验证。通过 btcli 或 btcli help 可以查看命令列表：

```c
c906>btcli
[*] init : Initialize bt adater
[*] deinit : DeInitialize bt adater
[*] scan_mode : <0~2>:0‑NONE,1‑page scan,2‑inquiry scan&page scan
[*] scan : <on/off>: device discovery
[*] scan_list : list available devices
[*] io_cap : <0~3>:0‑displayonly,1‑displayyesno,2‑keyboardonly,3‑noinputnooutput
[*] get_dev_name : get remote device name
[*] get_name : get bt adapter name
[*] set_name : <name>:set bt adapter name
[*] get_mac : get bt adapter address
[*] pincode : <0000~9999>:enter pincode
[*] passkey : <000000~999999>:enter passkey
[*] passkey_confirm : confirm passkey
[*] pairing_confirm : confirm pairing
[*] paired_list : list paired devices
[*] unpair_dev : unpair bond devices
[*] a2dp_src : support paly songs and other functions,use a2dp_src help view
[*] a2dp_snk : support receive audio, use a2dp_snk help view
[*] avrc : support audio playback control and other functions, use avrc help view
[*] hfp : support answering, hanging up, rejecting, voice dialing and other functions, use hfp help view
[*] spps : support data transmission, use spps help view
[*] sppc : support data transmission, use sppc help view
[*] ble : support ble, use ble help view
[*] gatt : support gatt, use gatt help view
[*] help : print this message and quit
For detail please use xxx help
```

a2dp_src、a2dp_snk、avrc、hfp、spps、sppc、ble、gatt还有二级命令，可以通过以下命令查看：

```
btcli a2dp_src help
btcli a2dp_snk help
btcli avrc help
btcli hfp help
btcli spps help
btcli sppc help
btcli ble help
btcli gatt help
```

例如：btcli a2dp_src help

```
c906>btcli a2dp_src help
$ a2dp_src help
[*] connect : <device mac>
[*] disconnect : <device mac>
[*] start : <‑p [folder path] or ‑f [file path]>
[*] control : <cmd>(pause play forward backward)
[*] stop : No parameters
[*] vol : <val>(val:0~100)
[*] help : print this message and quit
```

