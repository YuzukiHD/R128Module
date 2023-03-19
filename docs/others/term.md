# 术语表

## 硬件术语

| 术语       | 解释说明                                                     |
| ---------- | ------------------------------------------------------------ |
| sunxi      | 指 Allwinner 的一系列 SOC 硬件平台                           |
| Cortex-M33 | 基于 ARMv8-M 架构 32 位元微处理器单元                        |
| C906       | 平头哥推出的一款 RISC-V 架构的 64 位元处理器单元             |
| HIFI5      | Cadence 推出的 Cadence Tensilica HiFi 5 DSP 32 位处理器单元  |
| R128       | 全志推出的一款包含 M33+C906+HIFI5 处理器的 SoC 平台          |
| AudioCodec | 芯片内置音频接口                                             |
| I2S/PCM    | 外置数字音频接口，常用于外接codec 模块。                     |
| AHUB       | 音频集线器，内部集成I2S 接口及DAM 混音器，可实现多路输入播放及硬件混音功能 |
| S/PDIF     | 外置音响音频设备接口，一般使用同轴电缆或光纤接口。           |
| DMIC       | 外置数字MIC 接口                                             |
| MAD        | Mic Activity Detector, 语音能量检测模块                      |
| 同源播放   | 不同音频模块同时播放同一份音频数据                           |
| 同步采样   | 不同音频模块同时录音（可消除线程调度时差影响）               |

## 软件术语

| 术语         | 解释说明                                                     |
| ------------ | ------------------------------------------------------------ |
| FreeRTOS     | 一种开源的实时操作系统                                       |
| gcc          | GNU 开发的编程语言编译器。用于编译 M33 与 C906 上运行的程序  |
| xcc          | Xtensa C/C++ 编译器。用于编译在 HIFI5 运行的程序             |
| hwspinlock   | 在多核系统中，hwspinlock 提供一种硬件锁同步机制。            |
| ALSA         | Advanced Linux Sound Architecture                            |
| ASoC         | ALSA System on Chip                                          |
| DAPM         | 动态音频电源管理                                             |
| samplebit    | 样本精度，记录音频数据最基本的单位，常见的有 16 位           |
| channel      | 通道数，该参数为 1 表示单声道，2 表示立体声，大于 2 表示多声道 |
| rate         | 采样率，每秒钟采样次数，该次数是针对帧而言。                 |
| frame        | 帧，记录了一个声音单元，其长度为样本长度与通道数的乘积。     |
| period size  | 每次硬件中断处理音频数据的帧数。                             |
| period count | 处理完一个 buffer 数据所需的硬件中断次数。                   |
| buffer size  | 数据缓冲区大小 (period size * period count)                  |
| DRC          | 音频输出动态范围控制                                         |
| HPF          | 高通滤波                                                     |
| XRUN         | 音频流异常状态，分为 underrun 和 overrun 两种状态。          |
| 交错模式     | 一种音频数据记录模式，数据以连续帧形式存放<br/>(帧 1_L, 帧 1_R, 帧 2_L, 帧 2_R, —)。 |
| 非交错模式   | 一种音频数据记录模式，数据是以连续通道形式存放<br/>(L-帧 1, L-帧 2, —, R-帧 2, R-帧 2, —)。 |
| tinyalsa     | 在 Linux/RTOS 内核中与 ALSA 接口对接的库，可用于基本播录。   |
| alsalib      | 在 Linux/RTOS 内核中与 ALSA 接口对接的库，可用于基本播录，并可与常见音频算法组合使用。 |

