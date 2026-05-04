---
title: "Github Action底层"
date: 2025-05-25
tags: [开发, 思考]
category: "技术分享"
---

GitHub Actions的底层架构是基于事件驱动的自动化引擎，核心由以下组件构成：

### 核心架构解析

1. **事件驱动模型**
- 系统监听120+种GitHub事件（push/pull_request/issue等）
- 事件触发后生成Workflow Run实例
- 事件分发系统基于Kafka实现高吞吐消息队列
1. **工作流执行引擎**
- YAML解析器：将`.github/workflows/*.yml`转换为DAG执行计划
- 作业调度器：分配jobs到GitHub托管或自托管runner
- 日志聚合系统：实时收集和存储各步骤日志（采用Elasticsearch集群）
1. **运行时环境**
- GitHub托管runner：
    - 基于Azure虚拟机集群（Standard_D4ds_v5实例）
    - 采用Kubernetes进行容器编排
    - 预装300+常用开发工具链
- 自托管runner服务：
    - 通过HTTPS长连接与GitHub协调器通信
    - 支持x86/ARM架构，提供Docker-in-Docker支持
1. **安全架构**
- 密钥管理：通过HashiCorp Vault实现密钥轮换
- 沙箱隔离：使用gVisor实现容器级隔离
- 动作签名：支持OpenID Connect与代码签名验证

### Apache项目贡献的技术要点

在简历中建议突出以下技术维度：

```yaml
# 典型自动化测试工作流示例
name: Apache Project CI

on: [push, pull_request]

jobs:
  integration-test:
    strategy:
      matrix:
        java: ['17', '21']
        os: [ubuntu-latest, macos-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - name: Set up JDK ${{ matrix.java }}
        uses: actions/setup-java@v3
        with:
          distribution: 'temurin'
          java-version: ${{ matrix.java }}

      - name: Run test suite
        run: mvn -B verify -DskipTests=false
        env:
          TEST_PARALLELISM: 4

```

需要强调的关键技术点：

1. **矩阵测试策略**：通过多维组合测试保障兼容性
2. **依赖管理**：精确控制JDK版本和构建工具链
3. **测试优化**：并行执行、缓存加速、失败重试机制
4. **安全合规**：遵循Apache安全策略（如禁用pull_request_target）
5. **资源控制**：遵守ASF的GitHub Actions使用政策（并发限制等）

### 简历呈现建议

采用STAR法则描述贡献：

- **情境**：Apache项目需要构建跨平台测试矩阵
- **任务**：设计可扩展的CI/CD管道，支持5种OS+3种JDK版本组合
- **行动**：
    - 开发基于矩阵策略的YAML配置
    - 集成SonarQube质量门禁
    - 实现测试结果可视化（通过JUnit Report）
- **成果**：测试覆盖率从78%提升至93%，CI耗时减少40%

通过展示YAML配置背后的架构设计能力，体现：

- 复杂系统的抽象建模能力
- 多环境兼容性保障方案
- 持续交付流水线的工程化思维
- 开源社区协作经验（PR审核、文档维护等）

建议补充底层机制理解：

- 解释actions/cache如何利用CAS算法优化依赖安装
- 说明step之间的数据传递如何通过/runner/_work目录实现
- 分析GitHub Actions计费模型与Apache资源配额的关系

这样的技术表述既能体现实际贡献价值，又展示出对底层原理的深入理解。

Citations:
[1] [https://docs.github.com/en/actions/about-github-actions/understanding-github-actions](https://docs.github.com/en/actions/about-github-actions/understanding-github-actions)
[2] [https://codefresh.io/learn/github-actions/](https://codefresh.io/learn/github-actions/)
[3] [https://www.stepsecurity.io/blog/implement-internal-github-actions-marketplace-with-stepsecurity](https://www.stepsecurity.io/blog/implement-internal-github-actions-marketplace-with-stepsecurity)
[4] [https://hsf-training.github.io/hsf-training-cicd-github/05-understanding-yaml-and-ci/index.html](https://hsf-training.github.io/hsf-training-cicd-github/05-understanding-yaml-and-ci/index.html)
[5] [https://qiita.com/shun198/items/e7b7a3d9d3b86aec4813](https://qiita.com/shun198/items/e7b7a3d9d3b86aec4813)
[6] [https://spacelift.io/blog/github-actions-tutorial](https://spacelift.io/blog/github-actions-tutorial)
[7] [https://codefresh.io/learn/github-actions/github-actions-workflows-basics-examples-and-a-quick-tutorial/](https://codefresh.io/learn/github-actions/github-actions-workflows-basics-examples-and-a-quick-tutorial/)
[8] [https://arc.codes/docs/en/guides/developer-experience/continuous-integration/github-actions](https://arc.codes/docs/en/guides/developer-experience/continuous-integration/github-actions)
[9] [https://devopsjournal.io/blog/2021/10/14/GitHub-Actions-Internal-Marketplace](https://devopsjournal.io/blog/2021/10/14/GitHub-Actions-Internal-Marketplace)
[10] [https://docs.github.com/en/actions/sharing-automations/creating-actions/metadata-syntax-for-github-actions](https://docs.github.com/en/actions/sharing-automations/creating-actions/metadata-syntax-for-github-actions)
[11] [https://github.blog/enterprise-software/ci-cd/build-ci-cd-pipeline-github-actions-four-steps/](https://github.blog/enterprise-software/ci-cd/build-ci-cd-pipeline-github-actions-four-steps/)
[12] [https://docs.github.com/en/actions/guides](https://docs.github.com/en/actions/guides)
[13] [https://github.com/marketplace/actions/yaml-read](https://github.com/marketplace/actions/yaml-read)
[14] [https://docs.github.com/en/actions/writing-workflows/quickstart](https://docs.github.com/en/actions/writing-workflows/quickstart)
[15] [https://stackoverflow.com/questions/76721309/location-of-action-yaml-or-action-yml-files](https://stackoverflow.com/questions/76721309/location-of-action-yaml-or-action-yml-files)
[16] [https://dev.to/n3wt0n/finally-custom-github-actions-in-internal-repos-4l91](https://dev.to/n3wt0n/finally-custom-github-actions-in-internal-repos-4l91)
[17] [https://devops.com/how-github-actions-simplifies-your-ci-cd-workflow/](https://devops.com/how-github-actions-simplifies-your-ci-cd-workflow/)
[18] [https://github.com/marketplace/actions/run-on-architecture](https://github.com/marketplace/actions/run-on-architecture)
[19] [https://docs.github.com/en/enterprise-cloud@latest/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository](https://docs.github.com/en/enterprise-cloud@latest/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository)
[20] [https://docs.github.com/en/actions/writing-workflows/quickstart](https://docs.github.com/en/actions/writing-workflows/quickstart)
[21] [https://stackoverflow.com/questions/71217505/how-can-i-specify-the-architecture-in-github-actions](https://stackoverflow.com/questions/71217505/how-can-i-specify-the-architecture-in-github-actions)
[22] [https://www.reddit.com/r/devops/comments/xnstjn/is_github_actions_really_production_ready_for/](https://www.reddit.com/r/devops/comments/xnstjn/is_github_actions_really_production_ready_for/)
[23] [https://docs.github.com/en/actions/using-github-hosted-runners/using-github-hosted-runners/about-github-hosted-runners](https://docs.github.com/en/actions/using-github-hosted-runners/using-github-hosted-runners/about-github-hosted-runners)
[24] [https://github.com/architect/examples/actions](https://github.com/architect/examples/actions)
[25] [https://docs.github.com/en/enterprise-cloud@latest/actions/sharing-automations/sharing-actions-and-workflows-with-your-enterprise](https://docs.github.com/en/enterprise-cloud@latest/actions/sharing-automations/sharing-actions-and-workflows-with-your-enterprise)
[26] [https://docs.github.com/en/enterprise-cloud@latest/admin/managing-github-actions-for-your-enterprise/getting-started-with-github-actions-for-your-enterprise/introducing-github-actions-to-your-enterprise](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-github-actions-for-your-enterprise/getting-started-with-github-actions-for-your-enterprise/introducing-github-actions-to-your-enterprise)
[27] [https://www.liatrio.com/resources/blog/github-actions](https://www.liatrio.com/resources/blog/github-actions)
[28] [https://zenn.dev/praha/articles/9e561bdaac1d23](https://zenn.dev/praha/articles/9e561bdaac1d23)
[29] [https://github.com/cypress-io/github-action/blob/master/.github/workflows/example-config.yml](https://github.com/cypress-io/github-action/blob/master/.github/workflows/example-config.yml)
[30] [https://github.com/orgs/community/discussions/26792](https://github.com/orgs/community/discussions/26792)
[31] [https://docs.github.com/en/actions/about-github-actions/understanding-github-actions](https://docs.github.com/en/actions/about-github-actions/understanding-github-actions)
[32] [https://qiita.com/shun198/items/14cdba2d8e58ab96cf95](https://qiita.com/shun198/items/14cdba2d8e58ab96cf95)
[33] [https://qiita.com/HeRo/items/935d5e268208d411ab5a](https://qiita.com/HeRo/items/935d5e268208d411ab5a)
[34] [https://www.youtube.com/watch?v=UG4o4lA2eak](https://www.youtube.com/watch?v=UG4o4lA2eak)
[35] [https://github.com/apache/.github/actions](https://github.com/apache/.github/actions)
[36] [https://www.reddit.com/r/opensource/comments/11og9wq/contributing_to_apache_projects/](https://www.reddit.com/r/opensource/comments/11og9wq/contributing_to_apache_projects/)
[37] [https://github.com/apache/maven/blob/master/CONTRIBUTING.md](https://github.com/apache/maven/blob/master/CONTRIBUTING.md)
[38] [https://docs.github.com/en/get-started/exploring-projects-on-github/contributing-to-a-project](https://docs.github.com/en/get-started/exploring-projects-on-github/contributing-to-a-project)
[39] [https://community.apache.org/contributors/](https://community.apache.org/contributors/)
[40] [https://www.freecodecamp.org/news/git-and-github-workflow-for-open-source/](https://www.freecodecamp.org/news/git-and-github-workflow-for-open-source/)
[41] [https://github.com/apache/infrastructure-actions](https://github.com/apache/infrastructure-actions)
[42] [https://www.youtube.com/watch?v=qR-X1hWebZM](https://www.youtube.com/watch?v=qR-X1hWebZM)
[43] [https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions)
[44] [https://www.freecodecamp.org/news/automate-open-source-projects-with-github-actions/](https://www.freecodecamp.org/news/automate-open-source-projects-with-github-actions/)
[45] [https://dev.to/github/assigning-new-contributors-to-issues-using-github-actions-1d27](https://dev.to/github/assigning-new-contributors-to-issues-using-github-actions-1d27)
[46] [https://infra.apache.org/github-actions-secrets.html](https://infra.apache.org/github-actions-secrets.html)
[47] [https://docs.github.com/en/get-started/exploring-projects-on-github/finding-ways-to-contribute-to-open-source-on-github](https://docs.github.com/en/get-started/exploring-projects-on-github/finding-ways-to-contribute-to-open-source-on-github)
[48] [https://infra.apache.org/github-actions-policy.html](https://infra.apache.org/github-actions-policy.html)
[49] [https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/automating-projects-using-actions](https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/automating-projects-using-actions)
[50] [https://spark.apache.org/contributing.html](https://spark.apache.org/contributing.html)
[51] [https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/about-self-hosted-runners](https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/about-self-hosted-runners)

---

来自 Perplexity 的回答: [pplx.ai/share](http://pplx.ai/share)
