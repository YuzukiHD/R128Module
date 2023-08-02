# 快速开发入门

本文将简述 R128 SDK 开发方式，方便快速上手开发。

## SDK 基础知识

R128 平台拥有三个核心，Cortex M33 核心作为启动和安全核心，XuanTie C906 核心作为应用核运行用户 APP，HIFI5 作为算法核运行DSP算法。由于架构不同，不同的核心需要运行不同的 RTOS。

其中 Cortex M33 和 C906 运行的是 `FreeRTOS V10.4.3` 同一个内核支持两个不同架构的核心，其外设、组件、驱动是相同的。特性如下：

- 支持 Cortex-M33（Armv8-M）、C906（Riscv-64） 架构
- FreeRTOS V10.4.3 内核
- 支持标准 posix 接口
- 支持系统接口，用于内核以外的模块调用内核函数的接口
- 支持文件系统，包含设备管理器、分区管理器、文件系统实体管理器等，例如 littlefs、fat 等，实现对不同设备类型、分区类型、文件系统类型的集成
- 支持 newlibc 库

而 HIFI5 运行的是 Cadence 所推荐的 `FreeRTOS V10.2.0` 内核，其部分组件与 M33/C906 核心不同。特性如下：

- 支持 Xtensa HIFI5 架构
- FreeRTOS V10.2.0 内核
- 支持系统接口，用于内核以外的模块调用内核函数的接口
- 支持 VFPU/NN 算法库

所以在开发过程中，M33/C906 使用的是一套 FreeRTOS SDK，HIFI5 使用的是另外的一套 FreeRTOS SDK。这里将介绍 M33/C906 的开发入门，HIFI5的相关开发将在 DSP 章节介绍。

### SDK 目录架构

下表是简化版本的 SDK 目录结构，具体的说明在 【[SDK入门 - SDK 架构与目录结构](/r128/sdk_intro/sdk_tree?id=sdk-架构与目录结构)】中说明。

```
.
├── board               # 板级配置目录
│   ├── common          # 公共板级配置目录
│   │   ├── configs     # 公共板级配置
│   │   └── data        # 公共数据
│   └── r128s2          # R128 S2 芯片配置目录
│       └── module      # R128 S2 Module 模块板级配置目录
├── lichee              # 系统源码目录
│   ├── brandy-2.0      # 启动相关目录
│   ├── dsp             # HIFI5 FreeRTOS 系统、组件、应用
│   ├── rtos            # M33/C906 FreeRTOS 系统、组件、应用
│   ├── rtos-components # 公共应用组件，libc、多媒体、lvgl等
│   └── rtos-hal        # RTOS HAL驱动
├── out                 # 打包输出的临时文件与最终镜像文件
└── tools               # 用于存放打包相关的脚本、工具
```

