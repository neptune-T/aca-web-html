---
title: 'Set Prediction & Bipartite Matching'
date: '2025-11'
summary: 'The mathematical principles of human-computer interaction, including 2D set prediction, open-vocabulary generalization, and 3D physical reconstruction. This research explores how modern architectures utilize Transformer and diffusion models to address complex inverse problems in perception and generation processes.'
tags: ['HOI']
---

![](https://raw.githubusercontent.com/neptune-t/aca-web-html/main/public/img/hoi/1.png)

# Set Prediction Formalism

在传统的计算机视觉范式中，我们习惯于将图像理解任务转化为规则的网格预测或序列生成问题。然而，Human-Object Interaction (HOI) 的本质却是一个从连续的像素空间 $\mathcal{I}$ 到离散的、无序的三元组集合 $\mathcal{Y}$ 的映射。这种“集合到集合”的特性，迫使我们必须放弃传统的锚框（Anchor）与非极大值抑制（NMS）等启发式算法，转而寻求一种更纯粹的数学描述。

首先，我们需要严格定义 HOI 模型的输出空间。假设一张图像中存在 $M$ 个真实的交互关系，我们将 Ground Truth 定义为一个集合 $Y = \{y_i\}_{i=1}^M$。这里的每一个元素 $y_i$ 都是一个结构化的三元组 $(c_i, \mathbf{b}_{h,i}, \mathbf{b}_{o,i})$，分别代表交互动作的类别标签、人的边界框向量以及物体的边界框向量。神经网络的输出通常是一个固定长度的张量序列。假设我们设定模型输出 $N$ 个预测结果（其中 $N \gg M$），记为 $\hat{Y} = \{\hat{y}_i\}_{i=1}^N$。

这里的核心矛盾在于排列不变性（Permutation Invariance）：集合 $Y$ 中的元素是没有顺序的，而神经网络的输出 $\hat{Y}$ 却是索引化的（Indexed）。例如，预测结果 $\{\hat{y}_1, \hat{y}_2\}$ 与 $\{\hat{y}_2, \hat{y}_1\}$ 在数学上应该代表完全相同的预测状态，但在张量空间中它们却是两个不同的点。为了解决这个问题，我们将 $Y$ 扩充为 $Y'$，用空集元素 $\varnothing$（即 No Interaction）将其填充至与 $\hat{Y}$ 等长。此时，训练模型的目标就不再是简单的“元素对元素”的回归，而是寻找一个最优的排列 $\sigma$，使得预测序列在重排后与真实集合最为接近。

# 二分图匹配与最优传输

本质上我们可以形式化为一个二分图匹配（Bipartite Matching）问题，或者更广义地看作是最优传输（Optimal Transport）的一种离散特例。我们需要在预测集合 $\hat{Y}$ 与真实集合 $Y$ 之间建立一一映射。定义 $\mathfrak{S}_N$ 为 $N$ 个元素的对称群（即所有可能的排列集合）。我们的目标是寻找一个最优排列 $\hat{\sigma} \in \mathfrak{S}_N$，它能够最小化某种全局的匹配代价 $\mathcal{L}_{\text{match}}$。这个优化问题可以写成如下的变分形式：

$$
\hat{\sigma} = \underset{\sigma \in \mathfrak{S}_N}{\arg\min} \sum_{i=1}^{N} \mathcal{L}_{\text{match}}(y_i, \hat{y}_{\sigma(i)})
$$

这里的 $\mathcal{L}_{\text{match}}$ 是一个成对的代价函数，它定量描述了第 $i$ 个真实真值与第 $\sigma(i)$ 个预测值之间的“距离”。对于非空集元素，这个距离由分类误差和几何回归误差共同构成。值得注意的是，这种全局匹配消除了局部贪婪算法（如 NMS）的短视性，它强制模型在全局范围内权衡每一个预测值的归属，确保每个 Ground Truth 都有且仅有一个“专属”的预测槽位。

# 几何度量与损失景观

在确定了最优匹配 $\hat{\sigma}$ 之后，我们就从离散的组合优化问题回到了连续的可微优化问题。此时的训练损失函数 $\mathcal{L}_{\text{Hungarian}}$ 不再对排列 $\sigma$ 进行搜索，而是基于已经确定的 $\hat{\sigma}$ 计算梯度。为了保证几何回归的数值稳定性与尺度不变性，我们在定义空间距离时，通常摒弃单纯的 $\ell_1$ 范数，而是引入 GIoU (Generalized Intersection over Union)。GIoU 不仅满足度量空间的非负性和对称性，更重要的是它在两个框不重叠时依然具有非零梯度，能够引导预测框向真实框靠拢。因此，最终的损失函数呈现出一种优雅的混合形态：它包含了一个用于分类的负对数似然项（Negative Log-Likelihood），以及一个由 $\ell_1$ 和 GIoU 构成的几何约束项。这种基于集合预测的形式化（Set Prediction Formalism），不仅在数学上统一了分类与回归的训练目标，更在底层逻辑上实现了 HOI 检测的端到端（End-to-End）学习，让模型直接输出稀疏的、去重的三元组，展现了现代深度学习模型向数学完备性演进的趋势。

# Transformer 范式下的 HOI：

查询嵌入与全局注意力的数学实质在确立了基于集合预测的损失函数之后，核心的挑战转移到了函数逼近器（Function Approximator）的构建上。我们需要一个能够从图像特征空间 $\mathcal{F}$ 直接映射到离散三元组集合 $\mathcal{Y}$ 的参数化模型。在现代 HOI 检测架构（如 QPIC, CDN, HOTR）中，Transformer Decoder 扮演了这一关键角色。不同于卷积神经网络（CNN）对局部感受野的依赖，Transformer 通过自注意力（Self-Attention）与交叉注意力（Cross-Attention）机制，在数学上实现了一种全局的、基于内容的特征聚合。

## Learnable Queries 潜在交互的离散基底

DETR 类架构最显著的特征是引入了 Object Queries（在 HOI 中常被称为 Interaction Queries）。设 $Q \in \mathbb{R}^{N \times d}$ 为一组可学习的参数矩阵，其中 $N$ 是预测槽位的数量，$d$ 是特征维度。从数理统计的角度来看，这些 Queries 并非随机的噪声，而是通过反向传播在整个数据集上学习到的先验分布的离散基底。

每一个查询向量 $q_i \in \mathbb{R}^d$ 可以被视为寻找特定交互模式的“探针”。在训练收敛后，这些 Queries 会自组织地分布在特征空间中，分别关注图像中不同的空间位置或不同的物体大小。它们取代了传统检测器中手工设计的 Anchor Box，不再依赖于固定的几何网格，而是构成了潜在交互空间的一个稀疏覆盖。这种参数化方式使得模型能够摆脱空间先验的束缚，直接对交互关系的语义属性进行建模。

## Cross-Attention 特征空间的软寻址

当这组 Queries 进入 Transformer Decoder 后，它们首先通过交叉注意力机制与编码器输出的图像特征图 $F \in \mathbb{R}^{HW \times d}$ 进行交互。数学上，这是一个基于点积相似度的软寻址（Soft-Lookup）过程。对于第 $i$ 个查询 $q_i$，其更新过程可以表示为对图像特征 $F$ 的加权求和：

$$
\text{Attn}(q_i, F) = \sum_{j=1}^{HW} \alpha_{i,j} (F_j W_v)
$$

其中，权重系数 $\alpha_{i,j}$ 由 Softmax 函数归一化的点积决定：

$$\alpha_{i,j} = \frac{\exp(\frac{1}{\sqrt{d}} (q_i W_q)(F_j W_k)^T)}{\sum_{l=1}^{HW} \exp(\frac{1}{\sqrt{d}} (q_i W_q)(F_l W_k)^T)}
$$

这里的核心洞察在于，注意力权重 $\alpha_{i,j}$ 本质上构建了一个从 Query 域到 Pixel 域的动态路由图。对于 HOI 任务而言，一个负责检测“骑马”交互的 Query，其注意力分布会自动形成双峰（Bi-modal）结构——同时高响应于图像中的“人”区域和“马”区域，而抑制背景噪声。这种机制让模型能够在没有显式 Region Proposal 的情况下，通过特征层面的相关性直接捕获长距离的人-物依赖关系。

## Self-Attention 预测集合的联合建模

如果说 Cross-Attention 负责从图像中提取信息，那么 Decoder 内部的 Self-Attention 则负责在 $N$ 个 Queries 之间进行消息传递（Message Passing）。这是一个全连接图结构，其中每个节点都是一个潜在的预测结果。

$$
\text{SelfAttn}(Q) = \text{softmax}\left(\frac{Q Q^T}{\sqrt{d}}\right) V
$$

在数学意义上，这一步是为了解决输出集合的联合概率分布问题。在传统检测器中，每个 Anchor 的预测是独立的，因此需要 NMS 来处理冗余。而在 Transformer 中，Self-Attention 允许 Queries 之间相互“感知”。如果 $q_i$ 已经强烈倾向于预测图像左上角的“人-椅交互”，它可以通过抑制其他相似 Query 的激活，或者增强与其相关的其他 Query（例如同一场景下的其他交互），来实现隐式的去重和上下文推理。这种机制保证了模型输出的 $N$ 个预测不再是独立同分布（i.i.d.）的假设结果，而是一个经过全局协调的、具有结构化依赖关系的整体集合。最终，每个更新后的 Query $q_i'$ 经过多层感知机（MLP）解码，分别映射到人的坐标 $\mathbf{b}_{h}$、物的坐标 $\mathbf{b}_{o}$ 以及交互动词的概率分布 $p(c)$，完成了从抽象特征到具体语义的最终坍缩。



# 开放词汇 HOI 与多模态特征对齐

在经典的监督学习框架下，HOI 检测被形式化为一个封闭集合上的分类问题。模型的输出层是一个固定维度的全连接层，其权重矩阵 $W \in \mathbb{R}^{d \times K}$ 严格对应着预定义的 $K$ 个交互类别。然而，这种离散的、独热（One-hot）编码方式存在本质的数学缺陷：它在特征空间中割裂了类别之间的语义联系。例如，“骑自行车”与“骑摩托车”在语义上高度相关，但在传统的分类器看来，它们只是两个正交的、毫无关联的维度。为了突破这一局限，迈向开放词汇（Open-Vocabulary）检测，我们需要将分类问题重构为连续特征空间中的对齐与度量（Alignment and Metric）问题。

1. 共享潜空间的几何结构开放词汇 HOI 的核心思想是引入自然语言作为监督信号，利用大规模预训练模型（如 CLIP）构建的共享潜空间（Shared Latent Space）。在这个高维黎曼流形 $\mathcal{S}$ 中，无论是视觉信号（图像区域）还是语言信号（文本描述），都被映射为单位球面上的向量。设视觉编码器为 $E_v: \mathcal{I} \rightarrow \mathbb{R}^d$，文本编码器为 $E_t: \mathcal{L} \rightarrow \mathbb{R}^d$。对于一个潜在的交互三元组，我们不再训练一个随机初始化的分类头，而是利用 $E_t$ 生成文本嵌入（Text Embeddings）。假设我们有一个描述 "A photo of a person [VERB]ing a [OBJECT]"，我们将其输入文本编码器得到向量 $\mathbf{t}_{vo}$。同时，模型从图像中提取出对应的视觉特征向量 $\mathbf{v}_{roi}$。此时，分类的判定依据不再是简单的线性投影，而是计算两个向量在 $\mathcal{S}$ 空间中的余弦相似度（Cosine Similarity）：

   $$

   \text{sim}(\mathbf{v}_{roi}, \mathbf{t}_{vo}) = \frac{\mathbf{v}_{roi} \cdot \mathbf{t}_{vo}}{\|\mathbf{v}_{roi}\| \|\mathbf{t}_{vo}\|}
   
   $$

   这种形式化将“分类”转化为了“检索”。数学上的优势在于，$\mathbf{t}_{vo}$ 携带了丰富的先验知识。如果模型学会了将“人”和“马”的视觉特征对齐到文本空间，那么即便它从未在训练集中见过“骑斑马”，只要语言模型理解“斑马”与“马”的向量距离很近，视觉模型就能通过泛化能力，将新的视觉模式映射到正确的语义邻域内。

2. 组合性的向量表示HOI 的特殊性在于其结构的组合性（Compositionality）。一个交互行为是由“动作（Verb）”和“物体（Object）”动态组合而成的。在数学上，这提出了一个挑战：如何构建一个能够解耦（Disentangle）且能重新组合的特征空间？简单的向量加法 $\mathbf{t}_{hoi} = \mathbf{t}_{verb} + \mathbf{t}_{object}$ 往往无法捕捉复杂的上下文语义。因此，现代方法通常采用提示学习（Prompt Learning）或知识蒸馏（Knowledge Distillation）的策略。我们定义一个复合函数 $\Phi(v, o)$，试图在连续空间中合成新的交互表示。训练的目标函数演变为最小化视觉特征分布 $P_V$ 与语言先验分布 $P_T$ 之间的 Kullback-Leibler 散度（KL-Divergence）：
   $$
   \mathcal{L}_{\text{align}} = \mathbb{E}_{x \sim \mathcal{D}} \left[ \text{KL}(P_T(y|x) \| P_V(y|x)) \right]
   $$
   这里，CLIP 的文本编码器充当了一个固定的“教师（Teacher）”，它定义了语义空间的拓扑结构；而 HOI 模型则是一个“学生（Student）”，通过优化上述损失函数，学习如何将其视觉特征流形“拉扯”并对齐到这个预定义的语义拓扑上。

3. 零样本推理的数理基础这种对齐机制的最终产物是零样本（Zero-Shot）推理能力。当我们面对一个训练集中从未出现的交互类别 $\langle \text{Human}, v_{new}, o_{new} \rangle$ 时，传统的分类器 $W$ 会因为维度缺失而失效。但在对齐后的空间中，只要我们可以生成对应的文本描述向量 $\mathbf{t}_{new} = E_t(\text{"person } v_{new} \text{ } o_{new}\text{"})$，我们就可以直接将其作为一个新的“锚点”放入特征空间。推理过程变成了计算视觉特征 $\mathbf{v}$ 与所有候选文本锚点 $\{\mathbf{t}_k\}$ 的点积，并取最大值。这在数学上等价于在一个由语言模型定义的度量空间中进行最近邻搜索（Nearest Neighbor Search）。这种范式的转变，彻底解除了 HOI 检测对标注数据的强依赖，将视觉感知的边界拓展到了语言所能描述的无限边界。



# 3D HOI 中的几何流形与物理约束

当我们试图从单张 RGB 图像中恢复 3D 人物与物体的空间关系时，我们面对的是一个经典的逆投影问题：由于深度信息的丢失，无数个 3D 构型可能投影得到完全相同的 2D 图像。为了在解空间中坍缩出唯一的、符合物理规律的解，现代 3D HOI 方法（如 PHOSA, CHORE）通常依赖于参数化流形（Parametric Manifolds）的低维表示与基于物理的正则化约束。

1. 参数化几何的低维嵌入直接回归高维的 3D 网格（Mesh）顶点不仅计算昂贵，而且难以保证拓扑结构的合理性。因此，我们在数学上引入了强先验模型，将人体和物体建模为低维参数空间中的函数。对于人体，SMPL（Skinned Multi-Person Linear）模型提供了一个可微的映射函数 $M(\beta, \theta, \gamma)$。
   $$
   M: \mathbb{R}^{|\beta|} \times \mathbb{R}^{|\theta|} \times \mathbb{R}^{|\gamma|} \rightarrow \mathbb{R}^{3 \times N_v}
   $$
   其中，$\beta$ 代表主成分分析（PCA）空间下的体型系数，$\theta \in \mathbb{R}^{72}$ 代表人体运动学链中的相对旋转（通常用轴角或四元数表示），$\gamma$ 则是全局位移。对于刚性物体，其状态空间则由李群 $SE(3)$ 中的变换矩阵 $(R, \mathbf{t})$ 描述。通过这种方式，原本需要在 $\mathbb{R}^{3 \times N_v}$ （数千个顶点）的高维空间进行的优化搜索，被大大压缩到了参数空间 $\Theta = \{\beta, \theta, R, \mathbf{t}\}$ 中。神经网络的任务转变为预测这组参数 $\Theta$，使得生成的 3D 几何体在语义和形态上与输入图像一致。
   
2. 弱透视投影与重投影误差为了监督这个参数回归过程，我们构建了一个可微渲染管线或几何投影模块。假设摄像机模型为弱透视投影（Weak Perspective Projection），定义投影算子 $\Pi(K, \cdot)$，其中 $K$ 为相机内参。训练的核心动力来自于重投影误差（Reprojection Error）的最小化。
    $$
    \mathcal{L}_{\text{proj}} = \sum_{j \in \mathcal{J}} \| \Pi(K, V_j(\Theta)) - \mathbf{x}_{2D, j} \|_2^2
    $$
    这里，$V_j(\Theta)$ 是 3D 空间中的第 $j$ 个关键点（如手腕、手肘），$\mathbf{x}_{2D, j}$ 是图像检测到的 2D 关键点。这个损失函数的几何意义是：寻找一组 3D 参数，使得它的影子（Shadow）与我们在图像中观测到的形状完美重合。然而，仅仅依靠 $\mathcal{L}_{\text{proj}}$ 会导致严重的深度歧义（Depth Ambiguity）——一个人在远处变得很大，和在近处变得很小，可能产生相似的 2D 投影。
    
3. 接触流形与物理一致性约束区分 HOI 重建与普通人体重建的关键，在于 **交互（Interaction）本身提供的物理约束。人和物体在空间中不是独立的，它们通过接触（Contact）** 耦合在一起。这种物理关系在数学上转化为两类核心的约束函数：接触吸引（Contact Attraction）与互斥惩罚（Interpenetration Penalty）。首先，我们定义接触。假设神经网络预测了一个接触图（Contact Map），指示了人体表面集合 $S_H$ 中哪些顶点处于接触状态。对于接触点集 $\mathcal{C} \subset S_H$，我们强制它们贴合物体表面 $S_O$。这可以通过最小化到表面的距离场（Distance Field）来实现：
$$
\mathcal{L}_{\text{contact}} = \sum_{\mathbf{v} \in \mathcal{C}} \min_{\mathbf{u} \in S_O} \| \mathbf{v} - \mathbf{u} \|_2^2
$$
其次，也是更具挑战性的一点，是防止“穿模”（Penetration）。物理世界中，两个实体不能占据同一空间体积。为了在优化中施加这一约束，我们通常利用符号距离场（Signed Distance Field, SDF）。设物体表面的 SDF 为 $\Phi_O(\mathbf{x})$，其中物体内部 $\Phi_O < 0$，外部 $\Phi_O > 0$。非穿透约束可以优雅地表述为一种单边损失：
$$
\mathcal{L}_{\text{penentration}} = \sum_{\mathbf{v} \in S_H} \text{ReLU}(- \Phi_O(\mathbf{v}))
$$
当人体顶点 $\mathbf{v}$ 位于物体外部时，$\Phi_O > 0$，损失为 0；一旦 $\mathbf{v}$ 侵入物体内部，$\Phi_O < 0$，损失函数会产生一个与侵入深度成正比的梯度，推动顶点沿法线方向反向移动。这种基于 SDF 的物理正则化，使得重构结果不仅仅是视觉上的“像”，更在几何上具备了物理世界的实体感（Solidity）。


# 从感知到创造：基于扩散模型的交互生成

至此，涵盖了从 2D 图像中提取信息以及在 3D 空间中重建几何。然而，人工智能的终极愿景不仅在于理解既有的世界，更在于创造全新的内容。HOI 生成任务（HOI Generation / Synthesis）要求模型根据给定的文本描述（如 "A person handing over a cup"），从无到有地合成出符合物理规律且动作自然的人-物交互序列。在数学上，这不再是一个寻找唯一解的优化问题，而是一个针对联合条件概率分布的建模与采样问题。

1. 交互状态空间的联合分布我们将一个交互序列定义为状态变量 $X = [X_H, X_O]$，其中 $X_H \in \mathbb{R}^{T \times d_h}$ 代表人体在 $T$ 帧内的姿态与位移序列，$X_O \in \mathbb{R}^{T \times d_o}$ 代表物体的运动轨迹。生成的本质是学习一个概率密度函数 $p(X | C)$，其中 $C$ 是条件变量（如文本描述或初始状态）。由于人与物体的运动存在高度的时空耦合性（Coupling），直接对 $p(X_H)$ 和 $p(X_O)$ 分别建模会导致交互的割裂（例如手在动但物体滞后）。因此，现代生成模型（如 OMOMO, InterDiff）通常采用 **联合扩散（Joint Diffusion）** 策略。我们将人和物体的数据拼接（Concatenate）在同一特征维度上，视为一个整体的动力学系统，并在该联合空间上定义前向加噪过程：
   $$
   q(X_t | X_{t-1}) = \mathcal{N}(X_t; \sqrt{1-\beta_t} X_{t-1}, \beta_t \mathbf{I})
   $$
   这里的核心数学直觉是：虽然清晰的交互动作（$X_0$）必须遵循严格的物理约束，但在高斯噪声主导的潜空间（$X_T$）中，这些复杂的耦合关系被打破并平滑化了。生成模型的目标，就是学习逆向的去噪过程 $p_\theta(X_{t-1} | X_t, C)$，从混沌的噪声中同步“雕刻”出人和物体的协同运动。

2. 引导采样与几何梯度场在生成过程中，最大的挑战在于如何确保生成的动作不仅看起来自然，而且精确满足交互的几何要求（如手掌不穿模且紧贴杯壁）。标准的扩散模型虽然能生成分布内的样本，但难以保证精确的零样本接触。为此，我们引入了 **测试时引导（Test-time Guidance）** 技术。这就好比我们在概率流形的下降过程中，施加了一个额外的势能场。假设我们定义了一个能量函数 $\mathcal{E}_{phy}(X_t)$ 来度量当前的物理违规程度（如接触距离、穿透深度，类似于我们在重建篇中定义的 Loss）。在去噪采样的每一步（Langevin Dynamics 或 DDIM Step），我们不仅依据预训练模型的预测 $\epsilon_\theta(X_t, t, C)$ 进行更新，还沿着该能量函数的负梯度方向对状态 $X_t$ 进行微调：
   $$
   \hat{X}_{t-1} \leftarrow \mu_\theta(X_t) - s \cdot \Sigma_\theta(X_t) \nabla_{X_t} \mathcal{E}_{phy}(X_t)
   $$
   这里的 $\nabla_{X_t} \mathcal{E}_{phy}$ 充当了一个几何梯度场（Geometric Gradient Field），它像一只无形的手，在生成的过程中实时修正轨迹，强行将概率质量（Probability Mass）推向符合物理常识的流形区域。这种方法巧妙地结合了数据驱动的生成能力（Data-driven Prior）与基于规则的物理约束（Physics-based Constraint）。
   
3. 可供性图与空间概率锚定最后，为了让生成更具可控性，我们必须引入可供性（Affordance）的概念。在数学上，Affordance 可以被建模为一个定义在物体表面或周围空间的三维概率场 $A: \mathbb{R}^3 \rightarrow [0, 1]$。对于一个给定的物体（如椅子），$A(\mathbf{x})$ 的高值区域指示了“可坐”或“可搬运”的空间位置。在生成框架中，Affordance Map 充当了连接语义意图与几何位置的空间锚点（Spatial Anchor）。我们可以将学习到的 Affordance 特征注入到 Transformer 的 Cross-Attention 层中，或者作为额外的条件通道 $C_{aff}$ 输入到去噪网络。这在概率上相当于对解空间进行了更细粒度的剪枝：$p(X | C, C_{aff})$。它极大地缩减了搜索空间，确保生成的人体不仅动作流畅，而且能够准确地与物体上的特定功能区域（Functional Region）发生交互，从而实现了从“生成动作”到“生成功能性行为”的质的飞跃。