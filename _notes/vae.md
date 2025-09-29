---
title: 'An Introduction to Variational Autoencoders'
date: '2024-08'
summary: 'Analyzed the difficulty in deep latent variable models where the marginal likelihood is intractable and cannot be directly optimized, and introduced the framework of variational inference, where an encoder is used to approximate the true posterior distribution, thereby transforming the problem into the optimization of the Evidence Lower Bound (ELBO). Applied the reparameterization trick to enable gradient-based optimization of the ELBO by making the sampling process differentiable, and ultimately achieved end-to-end training of the entire generative model, including both the encoder and the decoder.'
tags: ['generative model']
---

# Introduction


这是笔者在大学二年级暑假时撰写的关于变分自编码器 (VAE) 的学习笔记。笔记全文采用 Typst 进行编写与排版，此 README 版本由 Typst 源码经 Google Gemini 辅助转换生成。可点击链接查看原本 pdf 格式内容。 [![查看笔记](https://img.shields.io/badge/查看笔记-VAE_Notes-9cf)](https://raw.githubusercontent.com/neptune-t/aca-web-html/main/public/notes/vae.pdf)


## Motivation

机器学习的一个主要分支是生成模型和判别模型。在判别建模中，目标是学习给定观察值的预测器，而在生成建模中，目标是解决学习所有变量**All variables**的联合分布。

生成模型模拟数据在现实世界中的生成方式。在几乎每一门科学中，“建模”都被理解为通过假设理论和通过观察测试这些理论来揭示这个生成过程。例如，当气象学家为天气建模时，他们使用高度复杂的偏微分方程来表达天气的潜在物理特性。生物学家、化学家、经济学家等等也是如此。科学中的建模实际上几乎全是生成模型。

试图理解数据生成过程的另一个原因是，它自然地表达了世界的因果关系。因果关系的优点，就是它们比单纯的相关性更能概括新情况。

为了将生成模型转化为Discriminator，我们需要使用贝叶斯规则。即我们可以将生成模型的输出转换为分类任务中需要的条件概率，从而实现判别功能。

在判别方法中，我们直接学习一个与未来预测方向一致的映射。这与生成模型的方向相反。例如，可以认为一张图像在现实世界中是通过先识别物体，然后生成三维物体，再将其投影到像素网格上来生成的。

而判别模型则直接将这些像素值作为输入，并将其映射到标签上。虽然生成模型能够有效地从数据中学习，但它们往往比纯粹的判别模型对数据做出更强的假设，这通常会在模型出错时导致更高的渐近偏差（*Asymptotic bias*）。

因此，如果模型出错（事实上几乎总是有一定程度的误差），如果我们只关注于学习如何区分，并且我们有足够多的数据，那么纯粹的判别模型在判别任务中通常会导致更少的错误。然而，取决于数据量的多少，研究数据生成过程可能有助于指导判别器（如分类器）的训练。例如，在半监督学习的情况下，我们可能只有少量的标记样本，但有更多的未标记样本。在这种情况下，可以利用数据的生成模型来改进分类。

这种方法可以帮助我们构建有用的世界抽象，这些抽象可以用于多个后续的预测任务。这种追求数据中解缠、语义上有意义、统计上独立和因果关系的变化因素的过程，通常被称为无监督表示学习，而变分自编码器（VAE）已经广泛应用于此目的。

或者，可以将其视为一种隐式正则化形式：通过强制表示对数据生成过程有意义，我们将从输入到表示的映射过程约束在某种特定的模式中。通过预测世界这一辅助任务，我们可以在抽象层面上更好地理解世界，从而更好地进行后续的预测。

变分自编码器（VAE）可以看作是两个耦合但独立参数化的模型：编码器或识别模型 **(Encoder or Recognition Model)**，以及解码器或生成模型 **(Decoder or Generative Model)**。这两个模型相互支持。识别模型向生成模型提供其后验分布的近似值，后者需要这些近似值在“期望最大化”学习的迭代过程中更新其参数。反过来，生成模型为识别模型提供了一个框架，使其能够学习数据的有意​​义表示，包括可能的类别标签。根据贝叶斯规则，识别模型是生成模型的近似逆。

与普通的变分推断（VI）相比，VAE框架的一个优势在于识别模型（也称为推断模型）现在是输入变量的一个（随机）函数。这与VI不同，后者对每个数据实例都有一个独立的变分分布，这对于大数据集来说效率低下。识别模型使用一组参数来建模输入与潜变量之间的关系，因此被称为“摊销推断”。这种识别模型可以是任意复杂的，但由于其构造方式，只需一次从输入到潜变量的前馈传递即可完成，因此仍然相对快速。然而，我们付出的代价是，这种采样会在学习所需的梯度中引入采样噪声。

或许VAE框架最大的贡献是认识到我们可以使用现在被称为“重参数化技巧”的简单方法来重新组织我们的梯度计算，从而减少梯度中的方差。

## Aim

*provides a principled method for jointly learning *deep latent-variable models* and corresponding inference models using *stochastic gradient descent*.*

该框架在生成建模、半监督学习和表示学习等方面有广泛的应用。

## Probabilistic Models and Variational Inference

由于概率模型包含未知数且数据很少能完整地描述这些未知参数，我们通常需要对模型的某些方面假设一定程度的不确定性。这种不确定性的程度和性质通过（条件）概率分布来描述。在某种意义上，最完整的概率模型形式通过这些变量的联合概率分布来指定模型中所有变量之间的相关性和高阶依赖关系。

我们用 $\mathbf{x}$ 表示所有观测变量的向量，其联合分布是我们希望建模的。（使用小写粗体来表示底层的观测随机变量集，即将其展平和拼接，使该集合表示为一个单一的向量。）

假设观测变量 $\mathbf{x}$ 是来自未知底层过程的随机样本，其真实的概率分布 $p^*(\mathbf{x})$ 是未知的。我们尝试用一个选定的模型 $p_\theta(\mathbf{x})$ 来近似这个底层过程，其中参数为$\theta$:
$$
\begin{equation}
\mathbf{x} \sim p_\theta(\mathbf{x})
\end{equation}
$$
学习最常见的是一个搜索参数 $\theta$ 的过程，使得由模型给出的概率分布函数 $p_\theta(\mathbf{x})$ 近似于数据的真实分布 $p^*(\mathbf{x})$，即对于任何观测到的 $\mathbf{x}$，两者尽可能接近:
$$
\begin{equation}
p_\theta(\mathbf{x}) \approx p^*(\mathbf{x})
\end{equation}
$$

### Conditional Models

在分类或者回归问题上面，我们不关心无条件模型 $p_\theta(\mathbf{x})$，更倾向于条件模型 $p_\theta(y|x)$，它近似于底层的条件分布 $p^*(y|x)$：即在观测变量 $\mathbf{x}$ 的值上，对变量 $y$ 的值进行分布。在这种情况下，$\mathbf{x}$ 通常被称为模型的输入。与无条件情况类似，我们选择并优化一个模型 $p_\theta(y|x)$，使其接近未知的底层分布，即对于任何 $\mathbf{x}$ 和 $y$:
$$
\begin{equation}
p_\theta(y|\mathbf{x}) \approx p^*(y|\mathbf{x})
\end{equation}
$$

## Directed Graphical Models and Neural Networks

我们使用有向概率图模型(Directed probability graph model)，或贝叶斯网络。有向图模型是一种概率模型，其中所有的变量被拓扑组织成一个有向无环图。这些模型的变量的联合分布被分解为先验分布和条件分布的乘积:
$$
\begin{equation}
p_\theta(\mathbf{X}_1, ..., \mathbf{X}_M) = \prod_{j=1}^{M} p_\theta(\mathbf{X}_j | P_a(\mathbf{X}_j))
\end{equation}
$$
$P_a(\mathbf{x}_j)$ 是有向图中节点 $j$ 的父向量的集合。

## Dataset

我们收集 $N \ge 1$ 个数据点组成的数据集 $\mathcal{D}$:
$$
\begin{equation}
\mathcal{D} = \{\mathbf{x}^{(1)}, \mathbf{x}^{(2)}, ..., \mathbf{x}^{(N)}\} \equiv \{\mathbf{x}^{(i)}\}_{i=1}^N \equiv \mathbf{x}^{(1:N)}
\end{equation}
$$
数据集被认为由同一（不变）系统的独立测量值组成。在这种情况下，观测数据 $\mathcal{D} = \{\mathbf{x}^{(i)}\}_{i=1}^N$ 被称为独立同分布(i.i.d.)。在独立同分布的假设下，给定参数的情况下，数据点的概率因子化为各个数据点概率的乘积。因此，模型分配给数据的对数概率表示为：
$$
\begin{equation}
\log p_\theta(\mathcal{D}) = \sum_{x \in \mathcal{D}} \log p_\theta(x)
\end{equation}
$$

## Maximum Likelihood and Minibatch SGD

概率模型最常见的标准是最大对数似然(ML). *Maximization of the log-likelihood criterion is equivalent to minimization of a Kullback Leibler divergence between the data and model distributions.*

优化方式比较好用的方法是 **_stochastic gradient descent_**

考虑一个数据集 $\mathcal{D}$ 包含N个数据点,我们无法每次都使用整个数据集来计算梯度，因为这样计算代价太高。因此，我们随机抽取一个小批量数据 $\mathcal{M}$（例如，大小为 $N_{\mathcal{M}}$），并计算这个小批量数据上的梯度。我们希望这个小批量数据上的梯度能够在期望值上等于整个数据集上的梯度。

在随机梯度下降中，这意味着（公式推导放在后面，不占用篇幅继续写结论）：
$$
\begin{equation}
\mathbb{E}[\nabla_\theta \log p_\theta(\mathcal{M})] = \nabla_\theta \log p_\theta(\mathcal{D})
\end{equation}
$$
$\mathcal{M}$ 是从 $\mathcal{D}$ 中随机抽出来的小批量数据，$\log p_\theta(\mathcal{M})$ 是这个小批量的对数似然，$\log p_\theta(\mathcal{D})$ 是整个数据集的对数似然。

对数似然无偏估计：

对于整个数据集 $\mathcal{D}$，其对数似然是：
$$
\begin{equation}
\log p_\theta(\mathcal{D}) = \sum_{x \in \mathcal{D}} \log p_\theta(x)
\end{equation}
$$
对于小批量数据 $\mathcal{M}$，其对数似然是：
$$
\begin{equation}
\log p_\theta(\mathcal{M}) = \sum_{x \in \mathcal{M}} \log p_\theta(x)
\end{equation}
$$
在期望上，小批量数据的对数似然可以近似整个数据集的对数似然：
$$
\begin{equation}
\frac{1}{N_\mathcal{D}} \log p_\theta(\mathcal{D}) \approx \frac{1}{N_\mathcal{M}} \log p_\theta(\mathcal{M})
\end{equation}
$$
通过这样的迷你批次**_minibatches_**，我们可以形成最大似然准则的无偏估计：
$$
\begin{equation}
\frac{1}{N_\mathcal{D}} \log p_\theta(\mathcal{D}) \approx \frac{1}{N_\mathcal{M}} \log p_\theta(\mathcal{M}) = \frac{1}{N_\mathcal{M}} \sum_{x \in \mathcal{M}} \log p_\theta(x)
\end{equation}
$$

$$
\begin{equation}
\frac{1}{N_\mathcal{D}} \nabla_\theta \log p_\theta(\mathcal{D}) \approx \frac{1}{N_\mathcal{M}} \nabla_\theta \log p_\theta(\mathcal{M}) = \frac{1}{N_\mathcal{M}} \sum_{x \in \mathcal{M}} \nabla_\theta \log p_\theta(x)
\end{equation}
$$

### 小批量数据的梯度期望值等于整个数据集的梯度

假设数据集 $\mathcal{D}$ 有 $N$ 个数据集，小批量 $\mathcal{M}$ 之中有 $N_\mathcal{M}$ 个数据集，并且小批量数据是从数据集中随机抽取的。

整个数据集的对数似然梯度:
$$
\begin{equation}
\nabla_\theta \log p_\theta(\mathcal{D}) = \nabla_\theta \sum_{i=1}^N \log p_\theta(x_i) = \sum_{i=1}^N \nabla_\theta \log p_\theta(x_i)
\end{equation}
$$
小批量数据的对数似然梯度：
$$
\begin{equation}
\nabla_\theta \log p_\theta(\mathcal{M}) = \frac{N}{N_\mathcal{M}} \sum_{j=1}^{N_\mathcal{M}} \nabla_\theta \log p_\theta(x_j)
\end{equation}
$$
这里乘以 $\frac{N}{N_\mathcal{M}}$ 证明写在后文，这里就不占篇幅继续向下推导了。

假设我们抽取了 $N_\mathcal{M}$ 个样本，样本是独立同分布的，我们可以用数学期望来表示这种抽样过程：
$$
\begin{equation}
\mathbb{E}[\nabla_\theta \log p_\theta(\mathcal{M})] = \mathbb{E}\left[\frac{N}{N_\mathcal{M}} \sum_{j=1}^{N_\mathcal{M}} \nabla_\theta \log p_\theta(x_j)\right]
\end{equation}
$$
由于 $\mathcal{M}$ 中的样本是独立同分布的，所以:
$$
\begin{equation}
\mathbb{E}\left[\sum_{j=1}^{N_\mathcal{M}} \nabla_\theta \log p_\theta(x_j)\right] = N_\mathcal{M} \mathbb{E}[\nabla_\theta \log p_\theta(x)]
\end{equation}
$$
其中 $x$ 是从 $\mathcal{D}$ 中随机抽取的一个样本。因此:
$$

\begin{align}
\mathbb{E}[\nabla_\theta \log p_\theta(\mathcal{M})] &= \mathbb{E}\left[\frac{N}{N_\mathcal{M}} \sum_{j=1}^{N_\mathcal{M}} \nabla_\theta \log p_\theta(x_j)\right] \\
&= \frac{N}{N_\mathcal{M}} N_\mathcal{M} \mathbb{E}[\nabla_\theta \log p_\theta(x)] \\
&= N \mathbb{E}[\nabla_\theta \log p_\theta(x)]
\end{align}

$$
由于数据点 $x$ 是从整个数据集中抽取的，所以 $\mathbb{E}[\nabla_\theta \log p_\theta(x)]$ 实际上就是总体梯度的平均值：
$$
\begin{equation}
N \mathbb{E}[\nabla_\theta \log p_\theta(x)] = \sum_{i=1}^N \nabla_\theta \log p_\theta(x_i) = \nabla_\theta \log p_\theta(\mathcal{D})
\end{equation}
$$

#### Coefficient proof

是为了补偿小批量数据与整个数据集的大小差异，使得梯度估计在期望值上保持一致。这里乘系数的原因是：

-   比例调整：由于小批量数据 $\mathcal{M}$ 只是整个数据集 $\mathcal{D}$ 的一个子集，其样本数量 $N_\mathcal{M}$ 小于 $N$。乘以比例系数可以调整小批量数据的梯度估计，使其在期望上与整个数据集的梯度一致。
-   无偏估计：这种调整确保了小批量数据梯度估计的期望值等于整体数据集的梯度，从而在期望上保持无偏。

定义整个数据集的对数似然梯度：
$$
\begin{equation}
\nabla_\theta \log p_\theta(\mathcal{D}) = \nabla_\theta \sum_{i=1}^N \log p_\theta(x_i) = \sum_{i=1}^N \nabla_\theta \log p_\theta(x_i)
\end{equation}
$$
定义小批量数据的对数似然梯度：
$$
\begin{equation}
\nabla_\theta \log p_\theta(\mathcal{M}) = \sum_{j=1}^{N_\mathcal{M}} \nabla_\theta \log p_\theta(x_j)
\end{equation}
$$
现在假设我们从数据集中随机抽取小批量数据 $\mathcal{M}$ ,由于 $\mathcal{M}$ 中的数据点是独立同分布的，我们有:
$$
\begin{equation}
\mathbb{E}[\nabla_\theta \log p_\theta(\mathcal{M})] = \mathbb{E}\left[\sum_{j=1}^{N_\mathcal{M}} \nabla_\theta \log p_\theta(x_j)\right] = N_\mathcal{M} \mathbb{E}[\nabla_\theta \log p_\theta(x)]
\end{equation}
$$
为了使小批量数据的梯度在期望上等于整个数据集的梯度，我们需要将小批量数据的梯度进行比例调整。我们定义调整后的梯度估计为：
$$
\begin{equation}
\tilde{\nabla}_\theta \log p_\theta(\mathcal{M}) = \frac{N}{N_\mathcal{M}} \sum_{j=1}^{N_\mathcal{M}} \nabla_\theta \log p_\theta(x_j)
\end{equation}
$$
我们现在计算这个调整后的梯度的期望值：
$$
\begin{align}
\mathbb{E}[\tilde{\nabla}_\theta \log p_\theta(\mathcal{M})] &= \mathbb{E}\left[\frac{N}{N_\mathcal{M}} \sum_{j=1}^{N_\mathcal{M}} \nabla_\theta \log p_\theta(x_j)\right] \\
&= \frac{N}{N_\mathcal{M}} \mathbb{E}\left[\sum_{j=1}^{N_\mathcal{M}} \nabla_\theta \log p_\theta(x_j)\right] \\
&= \frac{N}{N_\mathcal{M}} N_\mathcal{M} \mathbb{E}[\nabla_\theta \log p_\theta(x)] \\
&= N \mathbb{E}[\nabla_\theta \log p_\theta(x)]
\end{align}
$$
由于 $x$ 是从整个数据集中随机抽取的样本，我们有:
$$
\begin{equation}
N \mathbb{E}[\nabla_\theta \log p_\theta(x)] = \sum_{i=1}^N \nabla_\theta \log p_\theta(x_i) = \nabla_\theta \log p_\theta(\mathcal{D})
\end{equation}
$$

## Learning and Inference in Deep Latent Variable Models

### Latent Variables

我们可以将前一节讨论的完全观测有向模型扩展到包含潜变量的有向模型。潜变量是模型的一部分，但我们并不观测到它们，因此它们不属于数据集的一部分。我们通常用 $\mathbf{z}$ 来表示这样的潜变量。在无条件建模观测变量 $\mathbf{x}$ 的情况下，有向图模型将表示一个观测变量 $\mathbf{x}$ 和潜变量 $\mathbf{z}$ 的联合分布 $p_\theta(\mathbf{x}|\mathbf{z})$。观测变量 $\mathbf{x}$ 的边缘分布由以下公式给出：
$$
\begin{equation}
p_\theta = \int p_\theta(\mathbf{x}, \mathbf{z}) d\mathbf{z}
\end{equation}
$$
这也被称为（单个数据点的）边缘似然或模型证据，当它作为 $\theta$ 的函数时。

这种关于 $\mathbf{x}$ 的隐式分布可能是非常灵活的。如果 $\mathbf{z}$ 是离散的，并且 $p_\theta = (\mathbf{x}|\mathbf{z})$ 是一个高斯分布，那么 $p_\theta(\mathbf{x})$ 就是一个高斯混合分布。对于连续的 $\mathbf{z}$, $p_\theta(\mathbf{x})$ 可以看作是一个无限混合，这种混合潜在地比离散混合更强大。这样的边缘分布也称为复合概率分布。

### Deep Latent Variable Models

***deep latent variable model* (DLVM)**

表示那些分布由神经网络参数化的潜变量模型 $p_\theta(\mathbf{x}, \mathbf{z})$。这样的模型可以基于某些上下文条件，如 $p_\theta(\mathbf{x}, \mathbf{z} | \mathbf{y})$。DLVM 的一个重要优势是，即使有向模型中的每个因子（先验或条件分布）相对简单（例如条件高斯分布），其边缘分布 $p_\theta(\mathbf{x})$ 也可以非常复杂，即包含几乎任意的依赖关系。这种表达能力使得深度潜变量模型在近似复杂的底层分布 $p^*(\mathbf{x})$ 时非常有吸引力。

或许最简单也是最常见的 DLVM 是通过以下结构指定的分解模型：
$$
\begin{equation}
p_\theta(\mathbf{x}, \mathbf{z}) = p_\theta(\mathbf{z}) p_\theta(\mathbf{x}|\mathbf{z})
\end{equation}
$$
其中, $p_\theta(\mathbf{z})$ 和 $p_\theta(\mathbf{x}|\mathbf{z})$ 是已知的。分布 $p(\mathbf{z})$ 通常被称为潜变量 $\mathbf{z}$ 的先验分布，因为它不以任何观测数据为条件。


# Variational Autoencoders

## Encoder or Approximate Posterior

dlvm估计这种模型中的对数似然分布和后验分布的问题。变分自编码器(VAEs)框架提供了一种计算效率高的方法来优化dlvm，并结合相应的推理模型使用SGD进行优化。
为了将DLVM的后验推理和学习问题转化为可处理的问题，我们引入了一个参数推理模型 $q_\phi(\mathbf{z}|\mathbf{x})$。这个模型也被称为编码器或识别模型。用 $\phi$ 表示该推理模型的参数，也称为变分参数。我们优化变分参数 $\phi$:
$$
\begin{equation}
q_\phi(\mathbf{z}|\mathbf{x}) \approx p_\theta(\mathbf{z}|\mathbf{x})
\end{equation}
$$
像DLVM一样，推理模型可以是(几乎)任何有向图形模型:
$$
\begin{equation}
q_\phi(\mathbf{z}|\mathbf{x}) = q_\phi(\mathbf{z}_1, ..., \mathbf{z}_M | \mathbf{x}) = \prod_{j=1}^{M} q_\phi(\mathbf{z}_j | P_a(\mathbf{z}_j), \mathbf{x})
\end{equation}
$$
$P_a(\mathbf{z}_j)$ 是变量 $\mathbf{z}_j$ 在有向图中的父变量集合。与DLVM类似，分布 $q_\phi(\mathbf{z}|\mathbf{x})$ 可以使用深度神经网络参数化。
$$
\begin{equation}
(\mu, \log\sigma) = \text{EncoderNeuralNet}_\phi(x)
\end{equation}
$$

$$
\begin{equation}
q_\phi(\mathbf{z}|\mathbf{x}) = \mathcal{N}(z; \mu, \text{diag}(\sigma))
\end{equation}
$$
我们使用单个编码器神经网络对数据集中的所有数据点执行后验推理。这可以与更传统的变分推理方法形成对比，其中变分参数不是共享的，而是每个数据点单独迭代优化的。通过平摊推理，我们可以避免每个数据点的优化循环，并利用SGD的效率。

## Evidence Lower Bound (ELBO)

![It shows how to learn and generate new data through mapping between latent variable space ($\mathcal{z}$-space) and observed data space ($\mathcal{x}$-space).](https://raw.githubusercontent.com/neptune-t/aca-web-html/main/public/img/vae/vae.png)

VAE 通过编码器和解码器网络，利用先验分布、后验近似和重建分布，实现对复杂数据分布的近似建模和生成。

变分参数 $\phi$:
$$
\begin{align}
\log p_\theta(\mathbf{x}) &= \mathbb{E}_{q_\phi(\mathbf{z}|\mathbf{x})} [\log p_\theta(x)] \\
&= \mathbb{E}_{q_\phi(\mathbf{z}|\mathbf{x})} \left[\log \frac{p_\theta(\mathbf{x},\mathbf{z})}{p_\theta(\mathbf{z}|\mathbf{x})}\right] \\
&= \mathbb{E}_{q_\phi(\mathbf{z}|\mathbf{x})} \left[\log \frac{p_\theta(\mathbf{x},\mathbf{z})}{q_\phi(\mathbf{z}|\mathbf{x})} \frac{q_\phi(\mathbf{z}|\mathbf{x})}{p_\theta(\mathbf{z}|\mathbf{x})}\right] \\
&= \underbrace{\mathbb{E}_{q_\phi(\mathbf{z}|\mathbf{x})} \left[\log \frac{p_\theta(\mathbf{x},\mathbf{z})}{q_\phi(\mathbf{z}|\mathbf{x})}\right]}_{\mathcal{L}_{\theta, \phi}(x) \text{ ("ELBO")}} + \underbrace{\mathbb{E}_{q_\phi(\mathbf{z}|\mathbf{x})} \left[\log \frac{q_\phi(\mathbf{z}|\mathbf{x})}{p_\theta(\mathbf{z}|\mathbf{x})}\right]}_{D_{\text{KL}}(q_\phi(\mathbf{z}|\mathbf{x}) || p_\theta(\mathbf{z}|\mathbf{x}))}
\end{align}
$$
第二项是 $q_\phi(z|x)$ 与 $p_\theta(z|x)$ 之间的*Kullback-Leibler (KL)*散度是非负的,当等于0时，$q_\phi(z|x)$ 等于真实后验分布:
$$
\begin{equation}
D_{\text{KL}}(q_\phi(\mathbf{z}|\mathbf{x}) || p_\theta(\mathbf{z}|\mathbf{x})) \ge 0
\end{equation}
$$
第一项是变分下界，也称为证据下界(ELBO):
$$
\begin{equation}
\mathcal{L}_{\theta,\phi}(\mathbf{x}) = \mathbb{E}_{q_\phi(\mathbf{z}|\mathbf{x})} [\log p_\theta(\mathbf{x},\mathbf{z}) - \log q_\phi(\mathbf{z}|\mathbf{x})]
\end{equation}
$$
由于KL散度的非负性，ELBO是数据的对数似然的下界:
$$
\begin{align}
\mathcal{L}_{\theta,\phi}(\mathbf{x}) &= \log p_\theta(\mathbf{x}) - D_{\text{KL}}(q_\phi(\mathbf{z}|\mathbf{x}) || p_\theta(\mathbf{z}|\mathbf{x})) \\
&\le \log p_\theta(\mathbf{x})
\end{align}
$$



## Stochastic Gradient-Based Optimization of the ELBO

ELBO的一个重要性质是，它允许使用随机梯度下降(SGD)对所有参数( $\phi$ 和 $\theta$ )进行联合优化。

我们可以从 $\phi$ 和 $\theta$ 的随机初始值开始，随机优化它们的值，直到收敛。
$$
\begin{equation}
\mathcal{L}_{\theta, \phi}(\mathcal{D}) = \sum_{\mathbf{x} \in \mathcal{D}} \mathcal{L}_{\theta, \phi}(\mathbf{x})
\end{equation}
$$
一般来说，单个数据点ELBO及其梯度 $\nabla_{\theta,\phi} \mathcal{L}_{\theta,\phi}(x)$ 是难以处理的。然而，正如我们将展示的那样，存在良好的无偏估计量 $\tilde{\nabla}_{\theta,\phi}\mathcal{L}_{\theta,\phi}(x)$ ，这样我们仍然可以执行小批量SGD。生成模型参数 $\theta$ 下ELBO的无偏梯度很容易得到:
$$
\begin{align}
\nabla_{\theta} \mathcal{L}_{\theta, \phi}(\mathbf{x}) &= \nabla_{\theta} \mathbb{E}_{q_{\phi}(\mathbf{z})} [\log p_{\theta}(\mathbf{z}, \mathbf{z})] \\
&= \mathbb{E}_{q_{\phi}(\mathbf{z}|\mathbf{z})} [\nabla_{\theta}(\log p_{\theta}(\mathbf{x}, \mathbf{z}) - \log q_{\phi}(\mathbf{z}|\mathbf{z}))] \\
&\text{Monte Carlo} \nonumber \\
&\approx \nabla_{\theta}(\log p_{\theta}(\mathbf{x}, \mathbf{z}) - \log q_{\phi}(\mathbf{z}|\mathbf{x})) \\
&= \nabla_{\theta}(\log p_{\theta}(\mathbf{x}, \mathbf{z}))
\end{align}
$$

## Reparameterization Trick

对于连续潜变量和可微编码器和生成模型，可以通过变量的变化直接对ELBO进行 $\phi$ 和 $\theta$ 的微分，也称为重参数化技巧。

### Change of variables

首先，我们将随机变量 $\mathbf{z} \sim q_{\phi}(\mathbf{z}|\mathbf{x})$ 表示为另一个随机变量 $\epsilon$ 的可微(可逆)变换，给定 $z$ 和 $\phi$:
$$
\begin{equation}
\mathbf{z} = g(\epsilon, \phi, \mathbf{x})
\end{equation}
$$
其中，随机变量 $\epsilon$ 的分布与 $x$ 或 $\phi$ 无关。这一步的目的是将随机变量 $z$ 表示为一种可微分的方式，从而使得梯度可以有效地计算。

重新参数化技巧的主要优势在于它将不可微分的采样过程转化为可微分的参数化过程，从而使得梯度下降优化成为可能。

> **Algorithm 1**: ELBO的随机优化。由于噪声来源于小批量采样和 $p(\epsilon)$ 的采样，因此这是一个双重随机优化过程。我们也把这个过程称为自动编码变分贝叶斯(AEVB)*the Auto-Encoding Variational Bayes*算法。
>
> **Data:**
> - $\mathcal{D}$: Dataset
> - $q_\phi(z|x)$: Inference model
> - $p_\theta(x,z)$: Generative model
>
> **Result:**
> - $\theta, \phi$: Learned parameters
>
> ---
>
> $(\theta, \phi) \leftarrow$ Initialize parameters
>
> **while** SGD not converged **do**
>
> &nbsp;&nbsp;&nbsp;&nbsp; $\mathcal{M} \sim \mathcal{D}$ (Random minibatch of data)
>
> &nbsp;&nbsp;&nbsp;&nbsp; $\epsilon \sim p(\epsilon)$ (Random noise for every datapoint in $\mathcal{M}$)
>
> &nbsp;&nbsp;&nbsp;&nbsp; Compute $\tilde{\mathcal{L}}_{\theta,\phi}(\mathcal{M},\epsilon)$ and its gradients $\nabla_{\theta,\phi} \tilde{\mathcal{L}}_{\theta,\phi}(\mathcal{M},\epsilon)$
>
> &nbsp;&nbsp;&nbsp;&nbsp; Update $\theta$ and $\phi$ using SGD optimizer
>
> **end**

### Gradient of expectation under change of variable

在变量变换的基础上，我们可以将期望用新的随机变量 $\epsilon$ 表示：
$$
\begin{equation}
\mathbb{E}_{q_{\phi}(\mathbf{z})} [f(\mathbf{z})] = \mathbb{E}_{p(\epsilon)} [f(\mathbf{z})]
\end{equation}
$$
其中，$\mathbf{z}=g(\epsilon,\phi,\mathbf{x})$。通过这种变换，期望运算符和梯度运算符变得可交换，我们可以进行简单的蒙特卡罗估计:
$$
\begin{equation}
\nabla_{\phi} \mathbb{E}_{q_{\phi}(\mathbf{z})} [f(\mathbf{z})] = \nabla_{\phi} \mathbb{E}_{p(\epsilon)} [f(\mathbf{z})]
\end{equation}
$$
由于 $z$ 是 $\epsilon, \phi, x$ 的可微函数，我们可以交换梯度运算符和期望运算符,然后通过从 $p(\epsilon)$ 中采样 $\epsilon$，我们可以得到对梯度的近似估计：
$$
\begin{align}
\nabla_{\phi} \mathbb{E}_{q_{\phi}(\mathbf{z})} [f(\mathbf{z})] &= \mathbb{E}_{p(\epsilon)} [\nabla_{\phi} f(\mathbf{z})] \\
&\approx \nabla_{\phi} f(\mathbf{z})
\end{align}
$$

![This image illustrates the reparameterization trick, a critical technique in variational autoencoders (VAEs) for efficient gradient-based optimization. The trick allows us to rewrite the sampling process of latent variables in a differentiable manner.](
https://raw.githubusercontent.com/neptune-t/aca-web-html/main/public//img/vae/epsilon.png)

图 2 展示了重新参数化技巧的工作原理，主要包括以下两个部分：原始形式和重新参数化形式。

**左图：原始形式（Original form）**
-   **节点表示：**
    -   *灰色节点（Deterministic node）*：表示确定性节点，如目标函数 $f$。
    -   *蓝色节点（Random node）*：表示随机节点，如潜变量 $z$。
-   **图示描述：**
    -   随机变量 $z$ 从推断模型 $q_\phi(z|x)$ 中采样。
    -   目标函数 $f$ 依赖于 $z$ 和参数 $\phi$。
-   **问题：**
    -   我们希望对目标函数 $f$ 求梯度以优化参数 $\phi$。
    -   由于 $z$ 是从 $q_\phi(z|x)$ 中采样的，无法直接对 $z$ 进行反向传播，从而无法对 $\phi$ 求导。

**右图：重新参数化形式（Reparameterized form）**
-   **节点表示：**
    -   *灰色节点（Deterministic node）*：表示确定性节点，如目标函数 $f$。
    -   *蓝色节点（Random node）*：表示随机节点，如噪声 $\epsilon$。
-   **图示描述：**
    -   将随机变量 $z$ 表示为 $\epsilon, \phi, x$ 的可微函数： $z = g(\phi, x, \epsilon)$。
    -   $\epsilon$ 是从简单的分布 $p(\epsilon)$ 中采样的随机噪声。
-   **梯度计算：**
    -   由于 $z$ 现在是 $\epsilon, \phi, x$ 的可微函数，我们可以对 $z$ 进行反向传播。
    -   这使得我们可以对参数 $\phi$ 求导并优化目标函数 $f$。

**重新参数化技巧的步骤**

1.  变量变换：将潜变量 $z$ 表示为噪声 $\epsilon$ 和参数 $\phi$、观测数据 $x$ 的可微函数：$z = g(\epsilon, \phi,x)$。
2.  期望重写：利用变量变换，将期望用新的随机变量 $\epsilon$ 表示：$\mathbb{E}_{q_\phi(z|x)} [f(z)] = \mathbb{E}_{p(\epsilon)} [f(z)]$。
3.  梯度计算：交换梯度运算符和期望运算符，使用蒙特卡罗采样近似期望，从而计算梯度。

**重新参数化技巧的优势**

-   使梯度计算可行：通过将采样过程外部化，使得梯度可以通过反向传播进行计算。
-   提高计算效率：简化梯度计算过程，使用蒙特卡罗采样进行近似估计。



### Gradient of ELBO

在重新参数化的情况下，我们可以替换期望 $q_\phi(z|x)$ 与一个 $p(\epsilon)$。ELBO可以重写为:
$$
\begin{align}
\mathcal{L}_{\theta, \phi}(x) &= \mathbb{E}_{q_{\phi}(\mathbf{z}|\mathbf{x})} [\log p_{\theta}(\mathbf{x}, \mathbf{z}) - \log q_{\phi}(\mathbf{z}|\mathbf{z})] \\
&= \mathbb{E}_{p(\epsilon)} [\log p_{\theta}(\mathbf{x}, \mathbf{z}) - \log q_{\phi}(\mathbf{z}|\mathbf{x})]
\end{align}
$$
因此，我们可以形成单个数据点ELBO的简单蒙特卡罗估计量 $\tilde{\mathcal{L}}_{\theta, \phi}(x)$，其中我们使用来自 $p(\epsilon)$ 的单个噪声样本 $\epsilon$:
$$
\begin{equation}
\epsilon \sim p(\epsilon) \\
z = g(\phi, x, \epsilon) \\
\tilde{\mathcal{L}}_{\theta, \phi}(x) = \log p_{\theta}(x, z) - \log q_{\phi}(\mathbf{z}|\mathbf{x})
\end{equation}
$$
这一系列操作可以在TensorFlow等软件中表示为符号图，并毫不费力地微分参数 $\theta$ 和 $\phi$.

该算法最初被称为***Auto-Encoding Variational Bayes* (AEVB)**算法。更一般地说，重新参数化的ELBO估计被称为随机梯度变分贝叶斯***(SGVB)***估计。这个估计器也可以用来估计模型参数的后验.

### Computation of log $q_\phi(z|x)$

ELBO(估计量)的计算需要计算密度对数 $q_\phi(z|x)$，给定值 $x$，并给定值 $z$ 或等价的 $\epsilon$。这个对数密度是一个简单的计算，只要我们选择正确的变换 $g()$。

注意，我们通常知道密度 $p(\epsilon)$，因为这是所选噪声分布的密度。只要 $g(.)$ 是可逆函数，则 $\epsilon$ 和 $z$ 的密度关系式为:

(通过变量变换和概率密度函数的性质推导出来的,见2.4.4.1)
$$
\begin{equation}
\log q_{\phi}(\mathbf{z}|\mathbf{x}) = \log p(\epsilon) - \log d_{\phi}(\mathbf{x}, \epsilon)
\end{equation}
$$
其中第二项是雅可比矩阵 $\frac{\partial \mathbf{z}}{\partial \epsilon}$ 的行列式绝对值的对数,包含了从 $\epsilon$ 到 $z$ 变换的所有一阶导数:
$$
\begin{equation}
\log d_{\phi}(\mathbf{x}, \epsilon) = \log \left| \det\left(\frac{\partial \mathbf{z}}{\partial \epsilon}\right) \right|
\end{equation}
$$

$$
\begin{equation}
\frac{\partial \mathbf{z}}{\partial \epsilon} = \frac{\partial(z_1, ..., z_k)}{\partial(\epsilon_1, ..., \epsilon_k)} = \begin{pmatrix} \frac{\partial z_1}{\partial \epsilon_1} & \cdots & \frac{\partial z_1}{\partial \epsilon_k} \\ \vdots & \ddots & \vdots \\ \frac{\partial z_k}{\partial \epsilon_1} & \cdots & \frac{\partial z_k}{\partial \epsilon_k} \end{pmatrix}
\end{equation}
$$

#### deduce

假设我们有一个随机变量 $z$，它通过一个可微且可逆的变换 $g$ 由随机变量 $ϵ$ 得到，即：
$$
\begin{equation}
\mathbf{z} = g(\epsilon, \phi, \mathbf{x})

\end{equation}
$$
根据概率密度函数的变换性质，如果 $z=g(\epsilon)$，那么 $z$ 的概率密度函数 $q_\phi(z|x)$ 和 $\epsilon$ 的概率密度函数 $p(\epsilon)$ 之间有如下关系：
$$
\begin{equation}
q_{\phi}(\mathbf{z}|\mathbf{x}) = p(\epsilon) \left| \det\left(\frac{\partial \epsilon}{\partial \mathbf{z}}\right) \right|
\end{equation}
$$
但是，因为我们通常是知道 $\frac{\partial z}{\partial \epsilon}$ 而不是 $\frac{\partial \epsilon}{\partial z}$，我们需要使用雅可比行列式的逆关系：
$$
\begin{equation}
\left| \det\left(\frac{\partial \epsilon}{\partial z}\right) \right| = \frac{1}{\left| \det\left(\frac{\partial z}{\partial \epsilon}\right) \right|}
\end{equation}
$$
密度关系表示:
$$
\begin{equation}
q_{\phi}(\mathbf{z}) = p(\epsilon) \left| \det\left(\frac{\partial \epsilon}{\partial z}\right) \right| = p(\epsilon) \frac{1}{\left| \det\left(\frac{\partial z}{\partial \epsilon}\right) \right|}
\end{equation}
$$
$$
\begin{equation}
q_{\phi}(\mathbf{z}) = p(\epsilon) \left| \det\left(\frac{\partial z}{\partial \epsilon}\right) \right|^{-1}
\end{equation}
$$

## Factorized Gaussian posteriors

一个常见的选择是一个简单的*factorized Gaussian encoder*
$$
\begin{equation}
q_{\phi}(\mathbf{z}|\mathbf{x}) = \mathcal{N}(\mathbf{z}; \mu, \text{diag}(\sigma^2))
\end{equation}
$$
其中，$\mu$ 和 $\log\sigma$ 通过一个编码器神经网络 $\text{EncoderNeuralNet}_\phi(x)$ 获得：
$$
\begin{equation}
q_{\phi}(\mathbf{z}|\mathbf{x}) = \mathcal{N}(\mathbf{z}; \mu, \text{diag}(\sigma^2))
\end{equation}
$$
后验分布因子化为每个潜在变量 $z_i$ 的高斯分布的乘积：
$$
\begin{equation}
q_{\phi}(\mathbf{z}|\mathbf{x}) = \prod_i q_{\phi}(z_i|\mathbf{x}) = \prod_i \mathcal{N}(z_i; \mu_i, \sigma_i^2)
\end{equation}
$$
将高斯随机变量 $z$ 表示为标准正态分布 $\epsilon$ 经过线性变换的结果：
$$
\begin{equation}
\epsilon \sim \mathcal{N}(0, \mathbf{I})
\end{equation}
$$

$$
\begin{equation}
(\mu, \log\sigma) = \text{EncoderNeuralNet}_{\phi}(\mathbf{x})
\end{equation}
$$

$$
\begin{equation}
\mathbf{z} = \mu + \sigma \odot \epsilon
\end{equation}
$$
从 $ϵ$ 到 $z$ 的变换的雅可比矩阵是对角矩阵，其对角线元素是 $σ$:
$$
\begin{equation}
\frac{\partial z}{\partial \epsilon} = \text{diag}(\sigma)
\end{equation}
$$
对角矩阵的行列式是其对角线元素的乘积，因此其对数行列式是对角线元素的对数之和：
$$
\begin{equation}
\log d_{\phi}(\mathbf{x}, \epsilon) = \log \left| \det\left(\frac{\partial \mathbf{z}}{\partial \epsilon}\right) \right| = \sum_i \log \sigma_i
\end{equation}
$$
后验密度为:
$$
\begin{align}
\log q_{\phi}(\mathbf{z}|\mathbf{x}) &= \log p(\epsilon) - \log d_{\phi}(\mathbf{x}, \epsilon) \\
&= \sum_i \left( \log \mathcal{N}(\epsilon_i; 0, 1) - \log \sigma_i \right)
\end{align}
$$

### Full-covariance Gaussian posterior

因式高斯后验可以推广为具有全协方差的高斯:
$$
\begin{equation}
q_{\phi}(\mathbf{z}|\mathbf{x}) = \mathcal{N}(\mathbf{z}; \mathbf{\mu}, \mathbf{\Sigma})
\end{equation}
$$
该分布的重新参数化由下式给出:
$$
\begin{equation}
\epsilon \sim \mathcal{N}(0, \mathbf{I}) \\
\mathbf{z} = \mu + \mathbf{L}\epsilon
\end{equation}
$$
其中 $\mathbf{L}$ 是下(或上)三角矩阵，在对角线上有非零元素。非对角线元素定义了 $z$ 中元素的相关性(协方差)。对于这种全协方差高斯模型，雅可比行列式很简单，因为：
$$
\begin{equation}
\frac{\partial z}{\partial \epsilon} = \mathbf{L}
\end{equation}
$$
因为 $\mathbf{L}$ 是下(或上)三角矩阵，所以行列式是其对角线元素的乘积:
$$
\begin{equation}
\log \left| \det\left(\frac{\partial \mathbf{z}}{\partial \epsilon}\right) \right| = \sum_i \log|L_{ii}|
\end{equation}
$$
后验密度的对数计算为：
$$
\begin{equation}
\log q_{\phi}(\mathbf{z}|\mathbf{x}) = \log p(\epsilon) - \sum_i \log|L_{ii}|
\end{equation}
$$
协方差矩阵 $Σ$ 可以通过 Cholesky 分解得到：
$$
\begin{equation}
\Sigma = \mathbf{L}\mathbf{L}^T
\end{equation}
$$
协方差矩阵 $\Sigma$ 的计算过程为：
$$
\begin{equation}
\Sigma = \mathbb{E}[(\mathbf{z} - \mathbb{E}[\mathbf{z}])(\mathbf{z} - \mathbb{E}[\mathbf{z}])^T]
\end{equation}
$$
通过引入 $\epsilon$，我们有:
$$
\begin{equation}
\Sigma = \mathbb{E}[(\mathbf{z} - \mathbb{E}[\mathbf{z}])(\mathbf{z} - \mathbb{E}[\mathbf{z}])^T]
\end{equation}
$$
由于 $\epsilon \sim \mathcal{N}(0, \mathbf{I})$ 有：
$$
\begin{equation}
\mathbb{E}[\epsilon \epsilon^T] = \mathbf{I}
\end{equation}
$$
通过神经网络获取参数 $\mu$, $\log\sigma$ 和 $\mathbf{L}'$ ：
$$
\begin{equation}
(\mu, \log\sigma, \mathbf{L}') \leftarrow \text{EncoderNeuralNet}_{\phi}(\mathbf{x})
\end{equation}
$$
构建 $\mathbf{L}$ 矩阵:
$$
\begin{equation}
L \leftarrow \mathbf{L}_{\text{mask}} \odot \mathbf{L}' + \text{diag}(\sigma)
\end{equation}
$$
$\mathbf{L}_{\text{mask}}$ 是一个掩码矩阵，其对角线下方的元素为1，对角线和对角线上方的元素为0。

对于因子化高斯情形，后验密度的对数计算为：
$$
\begin{equation}
\log \left| \det\left(\frac{\partial \mathbf{z}}{\partial \epsilon}\right) \right| = \sum_i \log \sigma_i
\end{equation}
$$

> **Algorithm 2**: 单数据点ELBO无偏估计的计算，用于具有全协方差高斯推理模型和因子化伯努利生成模型的VAE示例。$L_{\text{mask}}$ 是一个掩蔽矩阵，主要用于控制哪些元素会被保留或忽略。对角线上及以上为零，对角线下为一。
>
> **Data:**
> - $x$: a datapoint, and optionally other conditioning information
> - $\epsilon$: a random sample from $p(\epsilon) = \mathcal{N}(0,I)$
> - $\theta$: Generative model parameters
> - $\phi$: Inference model parameters
> - $q_\phi(z|x)$: Inference model
> - $p_\theta(x,z)$: Generative model
>
> **Result:**
> - $\tilde{\mathcal{L}}$: 单数据点ELBO $\mathcal{L}_{\theta,\phi}(x)$ 的无偏估计
>
> ---
>
> $(\mu, \log\sigma, \mathbf{L}') \leftarrow \text{EncoderNeuralNet}_\phi(x)$
>
> $\mathbf{L} \leftarrow \mathbf{L}_{\text{mask}} \odot \mathbf{L}' + \text{diag}(\sigma)$
>
> $\epsilon \sim \mathcal{N}(0,I)$
>
> $z \leftarrow \mathbf{L}\epsilon + \mu$
>
> $\tilde{\mathcal{L}}_{\text{logqz}} \leftarrow -\sum_i (\frac{1}{2}(\epsilon_i^2 + \log(2\pi) + \log\sigma_i))$ *(Note: approximates $q_\phi(z|x)$)*
>
> $\tilde{\mathcal{L}}_{\text{logpz}} \leftarrow -\sum_i (\frac{1}{2}(z_i^2 + \log(2\pi)))$ *(Note: approximates $p_\theta(z)$)*
>
> $p \leftarrow \text{DecoderNeuralNet}_\theta(z)$
>
> $\tilde{\mathcal{L}}_{\text{logpx}} \leftarrow \sum_i (x_i \log p_i + (1 - x_i) \log(1 - p_i))$ *(Note: approximates $p_\theta(x|z)$)*
>
> $\tilde{\mathcal{L}} = \tilde{\mathcal{L}}_{\text{logpx}} + \tilde{\mathcal{L}}_{\text{logpz}} - \tilde{\mathcal{L}}_{\text{logqz}}$

## Estimation of the Marginal Likelihood

在训练一个VAE之后，我们可以使用抽样技术来估计模型下数据的概率。数据点的边际似然可以表示为:
$$
\begin{equation}
\log p_{\theta}(\mathbf{x}) = \log \mathbb{E}_{q_{\phi}(\mathbf{z}|\mathbf{x})} \left[ \frac{p_{\theta}(\mathbf{x}, \mathbf{z})}{q_{\phi}(\mathbf{z}|\mathbf{x})} \right]
\end{equation}
$$
取 $q_\phi(z|x)$ 的随机样本，其蒙特卡罗估计量为:
$$
\begin{equation}
\log p_{\theta}(\mathbf{x}) \approx \log \left( \frac{1}{L} \sum_{l=1}^{L} \frac{p_{\theta}(\mathbf{x}, \mathbf{z}^{(l)})}{q_{\phi}(\mathbf{z}^{(l)}|\mathbf{x})} \right)
\end{equation}
$$
每个 $z^{(l)} \sim q_{\phi}(z|\mathbf{x})$ 是从推断模型中随机采样得到的隐变量样本。

每次采样都会得到一个新的隐变量 $z^{(l)}$ ,对每一个 $l$,我们计算 $\frac{p_{\theta}(\mathbf{x}, z^{(l)})}{q_{\phi}(z^{(l)}|\mathbf{x})}$ ,然后求和取平均值。通过增加采样次数 $L$，这个估计会越来越接近实际的边缘似然。

## Marginal Likelihood and ELBO as KL Divergences

边缘似然是一个很难直接计算的量，通过ELBO的优化，可以间接优化边缘似然。提高ELBO的紧密性，即减少ELBO和真实边缘似然之间的差距

提高ELBO潜在紧密性的一种方法是增加生成模型的灵活性。(生成模型的灵活性决定了其拟合数据分布的能力),这可以通过ELBO和KL散度之间的联系来理解。

重点会解释*Evidence Lower Bound, ELBO*和*Kullback-Leibler* 是如何与变分自编码器（VAE）中的边缘似然（Marginal Likelihood）相关的。阐述如何通过提高生成模型的灵活性来增强ELBO的紧密性，并提供了ELBO和KL散度之间的数学联系.

**边缘似然和最大似然准则：**

对于一个独立同分布的（i.i.d.）数据集 $\mathcal{D}$，其大小为 $N_\mathcal{D}$ ，最大似然准则为：
$$
\begin{align}
\log p_{\theta}(\mathcal{D}) &= \frac{1}{N_{\mathcal{D}}} \sum_{x \in \mathcal{D}} \log p_{\theta}(x) \\
&= \mathbb{E}_{q_{\mathcal{D}}(x)}[\log p_{\theta}(x)]
\end{align}
$$
这里的 $q_\mathcal{D}(x)$ 是经验数据分布。

**经验数据分布：**
$$
\begin{equation}
q_{\mathcal{D}}(x) = \frac{1}{N} \sum_{i=1}^{N} q_{\mathcal{D}}^{(i)}(x)
\end{equation}
$$
每个组件 $q_\mathcal{D}^{(i)}(x)$ 通常对应于一个以值 $x^{(i)}$ 为中心的Dirac delta分布（对于连续数据），或者一个离散分布，所有概率质量集中在值 $x^{(i)}$ 上（对于离散数据）。

数据分布和模型分布之间的KL散度可以写成：
$$
\begin{align}
D_{KL}(q_{\mathcal{D}}(x) || p_{\theta}(x)) &= -\mathbb{E}_{q_{\mathcal{D}}(x)}[\log p_{\theta}(x)] + \mathbb{E}_{q_{\mathcal{D}}(x)}[\log q_{\mathcal{D}}(x)]  \\
&= -\log p_{\theta}(\mathcal{D}) + \text{常数} 
\end{align}
$$
这里的常数是 $-\mathcal{H}(q_{\mathcal{D}}(x))$,最小化这个KL散度等价于最大化数据对数似然 $\log p_\theta(\mathcal{D})$

通过结合经验数据分布 $q_D(x)$ 和推断模型 $q_\phi(z|x)$，我们得到了一个关于数据 $x$ 和潜变量 $z$ 的联合分布：
$$
\begin{equation}
q_{\mathcal{D}, \phi}(x, z) = q_{\mathcal{D}}(x) q_{\phi}(z|x)
\end{equation}
$$
而对于 $q_{\mathcal{D},\phi}(x,z)$ 和 $p_\theta(x,z)$ 之间的KL散度可以写成负的ELBO，再加上一个常数：
$$
\begin{align}
    & D_{KL}\!\left(q_{\mathcal{D}, \phi}(x, z) \,\|\, p_{\theta}(x, z)\right) \nonumber \\
    &\qquad = - \mathbb{E}_{q_{\mathcal{D}}(x)}\!\left[ \mathbb{E}_{q_{\phi}(z|x)}\!\left[ \log p_{\theta}(x, z) - \log q_{\phi}(z|x) \right] \right] - \mathbb{E}_{q_{\mathcal{D}}(x)}\!\left[ \log q_{\mathcal{D}}(x) \right] \\
    &\qquad = - \mathcal{L}_{\theta, \phi}(\mathcal{D}) + \text{常数}
\end{align}

$$
常数是 $-\mathcal{H}(q_{\mathcal{D}}(x))$

最大似然和ELBO目标之间的关系可以总结如下：
$$
\begin{align}
    D_{KL}(q_{\mathcal{D}, \phi}(x, z) \,||\, p_{\theta}(x, z)) &= D_{KL}(q_{\mathcal{D}}(x)) \nonumber \\
    &\quad + \mathbb{E}_{q_{\mathcal{D}}(x)}\!\left[ D_{KL}(q_{\phi}(z|x) \,||\, p_{\theta}(z|x)) \right]  \\
    &\ge D_{KL}(q_{\mathcal{D}}(x) \,||\, p_{\theta}(x)) 
\end{align}
$$
ELBO可以被视为在一个扩展空间中的最大似然目标。对于某个固定的编码器​ $q_\phi(x|z)$，联合分布 $p_\theta(x,z)$ 可以看作是对原始数据 $x$ 和每个数据点相关的随机辅助特征 $z$ 的扩展经验分布。

## Challenges

### Optimization issues

我们发现具有未修改下界目标的随机优化可能陷入不希望的稳定平衡。在训练开始时，似然项 $\log p(x|z)$ 相对较弱，因此初始吸引状态是 $q(z|x) \approx p(z)$，从而导致难以逃脱的稳定平衡。

后来提出的解决方案是使用一个优化调度，其中潜在成本 $D_{\text{KL}}(q(z|x) || p(z))$ 的权重在多个epoch中从0慢慢退火到1。

潜在维度被划分为 $K$ 组。 使用一个小批量目标来确保每个子集中使用的信息量不少于某个阈值 $\lambda$。

而最大似然目标*（ML objective）*可以看作是最小化 $D_{KL}(q_{\mathcal{D}}(x) || p_{\theta}(x))$，其中 $q_D(x)$ 是数据分布， $p_\theta(x)$ 是模型分布。

ELBO目标可以看作是最小化 $D_{KL}(q_{\mathcal{D}, \phi}(x, z) || p_{\theta}(x, z))$，其中 $q_{\mathcal{D},\phi}(x,z) = q_D(x)q_\phi(z|x)$

因为KL散度的方向,完美拟合是不可能的，那么 $p_\theta(x,z)$ 的方差通常会比 $q_{\mathcal{D},\phi}(x,z)$ 的方差大

![ELBO and Maximum Likelihood Objectives in VAE. This image illustrates the difference between the Maximum Likelihood (ML) objective and the Evidence Lower Bound (ELBO) objective in the context of a Variational Autoencoder (VAE), highlighting the roles of the encoder and decoder in the data and latent spaces.](/img/vae/ELBO_in_VAE.png)

**左图（编码过程）：**
-   数据分布 $q_D(x)$：数据在x空间的分布。
-   编码器 $q_\phi(z|x)$：将数据点从x空间编码到z空间，生成潜在变量
-   边缘分布 $q_\phi(z)$：在z空间中通过边缘化得到的潜在变量的分布。

数据 $x$ 从数据分布 $q_D(x)$ 经过编码器 $q_\phi(z|x)$ 映射到潜在空间 $z$。在潜在空间中，生成边缘分布 $q_\phi(z)$。

**右图：(解码过程)**
-   先验分布 $p_\theta(z)$：假设的潜在变量在z空间的分布，通常是标准正态分布。
-   解码器 $p_\theta(x|z)$：将潜在变量从z空间解码回x空间，生成数据点。
-   边缘分布 $p_\theta(x)$：在x空间中通过边缘化得到的生成数据的分布。

先验分布 $p_\theta(z)$ 提供了潜在变量 $z$ 的初始分布。解码器 $p_\theta(x|z)$ 将潜在变量 $z$ 映射回数据空间 $x$。在数据空间中，生成边缘分布 $p_\theta(x)$。

## Blurriness of generative model

2.7里面提到,优化ELBO相当于最小化 $D_{\text{KL}}(q_{\mathcal{D},\phi}(x, z)||p_{\theta}(x, z))$。如果 $q_{\mathcal{D},\phi}(x, z)$ 和 $p_\theta(x, z)$ 之间不可能完美拟合，那么 $p_\theta(x, z)$ 和 $p_\theta(x)$ 的方差最终将大于方差 $q_{\mathcal{D},\phi}(x, z)$ 和数据 $q_{\mathcal{D},\phi}(x)$。这是由于KL散度的方向;

如果 $(x,z)$ 的值可能在 $q_{\mathcal{D},\phi}$ 下，但不在 $p_\theta$ 下，则 $\mathbb{E}_{q_{\mathcal{D},\phi}(\mathbf{x}, \mathbf{z})} [\log p_{\theta}(\mathbf{x}, \mathbf{z})]$ 项趋于无穷。然而，反过来就不成立了:生成模型只在 $(x, z)$ 的值上放置概率质量而在 $q_{\mathcal{D},\phi}$ 下没有支持时受到轻微的惩罚。

因此，"模糊性"问题可以通过选择一个足够灵活的推理模型和/或一个足够灵活的生成模型来解决。


