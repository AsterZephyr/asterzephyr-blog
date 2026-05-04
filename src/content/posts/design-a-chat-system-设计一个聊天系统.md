---
title: "Design A Chat System 设计一个聊天系统"
date: 2025-05-01
tags: [开发, 思考]
category: "技术分享"
---

In this chapter we explore the design of a chat system. Almost everyone uses a chat app. Figure 1 shows some of the most popular apps in the marketplace.在本章中，我们将探讨聊天系统的设计。几乎每个人都使用聊天应用程序。图 1 显示了市场上一些最受欢迎的应用程序。

[](data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%27600%27%20height=%27184%27/%3e)

[](https://bytebytego.com/_next/image?url=%2Fimages%2Fcourses%2Fsystem-design-interview%2Fdesign-a-chat-system%2Ffigure-12-1-J3Z5T7TL.png&w=1200&q=75)

Figure 1  图 1

A chat app performs different functions for different people. It is extremely important to nail down the exact requirements. For example, you do not want to design a system that focuses on group chat when the interviewer has one-on-one chat in mind. It is important to explore the feature requirements.聊天应用针对不同的人执行不同的功能。确定确切的要求非常重要。例如，当面试官考虑一对一聊天时，您不想设计一个专注于群聊的系统。探索功能需求很重要。

# **Step 1 - Understand the problem and establish design scope步骤 1 - 了解问题并确定设计范围**

It is vital to agree on the type of chat app to design. In the marketplace, there are one-on-one chat apps like Facebook Messenger, WeChat, and WhatsApp, office chat apps that focus on group chat like Slack, or game chat apps, like Discord, that focus on large group interaction and low voice chat latency.就要设计的聊天应用类型达成一致至关重要。市场上有一对一聊天应用，如 Facebook Messenger、微信和 WhatsApp；有专注于群聊的办公聊天应用，如 Slack；还有专注于大群组互动和低语音聊天延迟的游戏聊天应用，如 Discord。

The first set of clarification questions should nail down what the interviewer has in mind exactly when she asks you to design a chat system. At the very least, figure out if you should focus on a one-on-one chat or group chat app. Some questions you might ask are as follows:第一组澄清问题应该明确面试官在要求你设计聊天系统时究竟在想什么。至少，弄清楚你应该专注于一对一聊天还是群聊应用程序。你可能会问以下一些问题：

**Candidate**: What kind of chat app shall we design? 1 on 1 or group based?**候选人**：我们应该设计什么样的聊天应用程序？一对一还是群组？**Interviewer**: It should support both 1 on 1 and group chat.**面试官**：应该支持一对一，也支持群聊。

**Candidate**: Is this a mobile app? Or a web app? Or both?**应聘者**：这是一个移动应用吗？还是一个网页应用？还是两者都有？**Interviewer**: Both.**采访人**： 两者都有。

**Candidate**: What is the scale of this app? A startup app or massive scale?**候选人**：这个应用的规模有多大？是初创应用还是大规模应用？**Interviewer**: It should support 50 million daily active users (DAU).**采访人**：它应该支持5000万每日活跃用户（DAU）。

**Candidate**: For group chat, what is the group member limit?**应聘者**：对于群聊，群成员人数限制是多少？**Interviewer**: A maximum of 100 people**采访人**：最多100人

**Candidate**: What features are important for the chat app? Can it support attachment?**应聘者**：聊天应用需要注意哪些功能？可以支持附件吗？**Interviewer**: 1 on 1 chat, group chat, online indicator. The system only supports text messages.**面试官**：一对一聊天、群聊、在线指示器。系统仅支持文本消息。

**Candidate**: Is there a message size limit?**应聘者**：邮件大小有限制吗？**Interviewer**: Yes, text length should be less than 100,000 characters long.**面试官**：是的，文本长度应小于10万个字符。

**Candidate**: Is end-to-end encryption required?**候选人**：需要端到端加密吗？**Interviewer**: Not required for now but we will discuss that if time allows.**采访人**：现在不需要，但如果时间允许，我们会讨论这个问题。

**Candidate**: How long shall we store the chat history?**应聘者**：聊天记录要保存多久？**Interviewer**: Forever.**采访人**：永远。

In the chapter, we focus on designing a chat app like Facebook messenger, with an emphasis on the following features:在本章中，我们重点设计类似 Facebook Messenger 的聊天应用程序，重点关注以下功能：

- A one-on-one chat with low delivery latency一对一聊天，传输延迟低
- Small group chat (max of 100 people)小组聊天（最多 100 人）
- Online presence 在线状态
- Multiple device support. The same account can be logged in to multiple accounts at the same time.多设备支持，同一个账号可以同时登录多个账户。
- Push notifications 推送通知

It is also important to agree on the design scale. We will design a system that supports 50 million DAU.就设计规模达成共识也很重要，我们会设计一个支持5000万DAU的系统。

# **Step 2 - Propose high-level design and get buy-in第 2 步 - 提出高层设计并获得认可**

To develop a high-quality design, we should have a basic knowledge of how clients and servers communicate. In a chat system, clients can be either mobile applications or web applications. Clients do not communicate directly with each other. Instead, each client connects to a chat service, which supports all the features mentioned above. Let us focus on fundamental operations. The chat service must support the following functions:为了开发高质量的设计，我们应该对客户端和服务器如何通信有基本的了解。在聊天系统中，客户端可以是移动应用程序，也可以是 Web 应用程序。客户端之间不直接通信。相反，每个客户端都连接到聊天服务，该服务支持上述所有功能。让我们关注基本操作。聊天服务必须支持以下功能：

- Receive messages from other clients.接收来自其他客户端的消息。
- Find the right recipients for each message and relay the message to the recipients.为每条消息找到正确的收件人，并将消息转发给收件人。
- If a recipient is not online, hold the messages for that recipient on the server until she is online.如果收件人不在线，则在服务器上保留该收件人的消息，直到她上线为止。

Figure 2 shows the relationships between clients (sender and receiver) and the chat service.图 2 显示了客户端（发送者和接收者）与聊天服务之间的关系。

[](data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%27500%27%20height=%2789%27/%3e)

[](https://bytebytego.com/_next/image?url=%2Fimages%2Fcourses%2Fsystem-design-interview%2Fdesign-a-chat-system%2Ffigure-12-2-CA3ZOSQI.png&w=1080&q=75)

Figure 2  图 2

When a client intends to start a chat, it connects the chats service using one or more network protocols. For a chat service, the choice of network protocols is important. Let us discuss this with the interviewer.当客户端想要开始聊天时，它会使用一种或多种网络协议连接聊天服务。对于聊天服务来说，网络协议的选择很重要。让我们与面试官讨论一下这个问题。

Requests are initiated by the client for most client/server applications. This is also true for the sender side of a chat application. In Figure 2, when the sender sends a message to the receiver via the chat service, it uses the time-tested HTTP protocol, which is the most common web protocol. In this scenario, the client opens a HTTP connection with the chat service and sends the message, informing the service to send the message to the receiver. The keep-alive is efficient for this because the keep-alive header allows a client to maintain a persistent connection with the chat service. It also reduces the number of TCP handshakes. HTTP is a fine option on the sender side, and many popular chat applications such as Facebook [1] used HTTP initially to send messages.对于大多数客户端/服务器应用程序，请求都是由客户端发起的。对于聊天应用程序的发送方而言，也是如此。在图 2 中，当发送方通过聊天服务向接收方发送消息时，它使用久经考验的 HTTP 协议，这是最常见的 Web 协议。在这种情况下，客户端打开与聊天服务的 HTTP 连接并发送消息，通知服务将消息发送给接收方。keep-alive 对此非常有效，因为 keep-alive 标头允许客户端与聊天服务保持持久连接。它还减少了 TCP 握手的次数。HTTP 是发送方的一个不错的选择，许多流行的聊天应用程序（如 Facebook [1]）最初都使用 HTTP 发送消息。

However, the receiver side is a bit more complicated. Since HTTP is client-initiated, it is not trivial to send messages from the server. Over the years, many techniques are used to simulate a server-initiated connection: polling, long polling, and WebSocket. Those are important techniques widely used in system design interviews so let us examine each of them.但是，接收方稍微复杂一些。由于 HTTP 是由客户端发起的，因此从服务器发送消息并非易事。多年来，许多技术都用于模拟服务器发起的连接：轮询、长轮询和 WebSocket。这些是系统设计面试中广泛使用的重要技术，因此让我们逐一研究一下。

# **Polling 轮询**

As shown in Figure 3, polling is a technique that the client periodically asks the server if there are messages available. Depending on polling frequency, polling could be costly. It could consume precious server resources to answer a question that offers no as an answer most of the time.如图 3 所示，轮询是一种客户端定期询问服务器是否有可用消息的技术。根据轮询频率，轮询的成本可能很高。它可能会消耗宝贵的服务器资源来回答一个大多数情况下答案为“否”的问题。

[](data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%27550%27%20height=%27587%27/%3e)

![](https://bytebytego.com/images/courses/system-design-interview/design-a-chat-system/figure-12-3-WYSR7WB4.svg)

Figure 3  图 3

# **Long polling 长轮询**

Because polling could be inefficient, the next progression is long polling (Figure 4).由于轮询可能效率低下，因此下一个进展是长轮询（图 4）。

[](data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%27600%27%20height=%27541%27/%3e)

![](https://bytebytego.com/images/courses/system-design-interview/design-a-chat-system/figure-12-4-6KL7KY4X.svg)

Figure 4  图 4

In long polling, a client holds the connection open until there are actually new messages available or a timeout threshold has been reached. Once the client receives new messages, it immediately sends another request to the server, restarting the process. Long polling has a few drawbacks:在长轮询中，客户端会保持连接打开，直到有新消息可用或达到超时阈值。一旦客户端收到新消息，它会立即向服务器发送另一个请求，重新启动该过程。长轮询有几个缺点：

- Sender and receiver may not connect to the same chat server. HTTP based servers are usually stateless. If you use round robin for load balancing, the server that receives the message might not have a long-polling connection with the client who receives the message.发送者和接收者可能不会连接到同一个聊天服务器。基于 HTTP 的服务器通常是无状态的。如果您使用循环机制进行负载平衡，则接收消息的服务器可能没有与接收消息的客户端建立长轮询连接。
- A server has no good way to tell if a client is disconnected.服务器没有好的方法来判断客户端是否已断开连接。
- It is inefficient. If a user does not chat much, long polling still makes periodic connections after timeouts.效率很低。如果用户聊天不多，长轮询在超时后仍会定期建立连接。

# **WebSocket**

WebSocket is the most common solution for sending asynchronous updates from server to client. Figure 5 shows how it works.WebSocket 是从服务器向客户端发送异步更新的最常见解决方案。图 5 显示了它的工作原理。

[](data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%27500%27%20height=%27308%27/%3e)

![](https://bytebytego.com/images/courses/system-design-interview/design-a-chat-system/figure-12-5-VPDI2T2E.svg)

Figure 5  图 5

WebSocket connection is initiated by the client. It is bi-directional and persistent. It starts its life as a HTTP connection and could be “upgraded” via some well-defined handshake to a WebSocket connection. Through this persistent connection, a server could send updates to a client. WebSocket connections generally work even if a firewall is in place. This is because they use port 80 or 443 which are also used by HTTP/HTTPS connections.WebSocket 连接由客户端发起。它是双向的并且是持久的。它以 HTTP 连接开始，可以通过一些明确定义的握手“升级”为 WebSocket 连接。通过此持久连接，服务器可以向客户端发送更新。即使有防火墙，WebSocket 连接通常也能正常工作。这是因为它们使用端口 80 或 443，而 HTTP/HTTPS 连接也使用这些端口。

Earlier we said that on the sender side HTTP is a fine protocol to use, but since WebSocket is bidirectional, there is no strong technical reason not to use it also for sending. Figure 6 shows how WebSockets (ws) is used for both sender and receiver sides.前面我们说过，在发送方，HTTP 是一种很好的协议，但由于 WebSocket 是双向的，因此没有充分的技术理由不使用它进行发送。图 6 显示了 WebSockets (ws) 如何用于发送方和接收方。

[](data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%27350%27%20height=%27200%27/%3e)

[](https://bytebytego.com/_next/image?url=%2Fimages%2Fcourses%2Fsystem-design-interview%2Fdesign-a-chat-system%2Ffigure-12-6-6UUW2AUS.png&w=750&q=75)

Figure 6  图 6

By using WebSocket for both sending and receiving, it simplifies the design and makes implementation on both client and server more straightforward. Since WebSocket connections are persistent, efficient connection management is critical on the server-side.通过使用 WebSocket 进行发送和接收，它简化了设计并使客户端和服务器上的实现更加直接。由于 WebSocket 连接是持久的，因此高效的连接管理在服务器端至关重要。

# **High-level design 高层设计**

Just now we mentioned that WebSocket was chosen as the main communication protocol between the client and server for its bidirectional communication, it is important to note that everything else does not have to be WebSocket. In fact, most features (sign up, login, user profile, etc) of a chat application could use the traditional request/response method over HTTP. Let us drill in a bit and look at the high-level components of the system.刚才我们提到，WebSocket 被选为客户端和服务器之间双向通信的主要通信协议，需要注意的是，其他一切并不一定要是 WebSocket。事实上，聊天应用程序的大多数功能（注册、登录、用户资料等）都可以使用传统的 HTTP 请求/响应方法。让我们深入研究一下，看看系统的高级组件。

As shown in Figure 7, the chat system is broken down into three major categories: stateless services, stateful services, and third-party integration.如图7所示，聊天系统分为三大类：无状态服务、有状态服务和第三方集成。

[](data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%27500%27%20height=%27646%27/%3e)

[](https://bytebytego.com/_next/image?url=%2Fimages%2Fcourses%2Fsystem-design-interview%2Fdesign-a-chat-system%2Ffigure-12-7-YA7UWFS6.png&w=1080&q=75)

Figure 7  图 7

### **Stateless Services 无状态服务**

Stateless services are traditional public-facing request/response services, used to manage the login, signup, user profile, etc. These are common features among many websites and apps.无状态服务是传统的面向公众的请求/响应服务，用于管理登录、注册、用户资料等。这些是许多网站和应用程序的共同功能。

Stateless services sit behind a load balancer whose job is to route requests to the correct services based on the request paths. These services can be monolithic or individual microservices. We do not need to build many of these stateless services by ourselves as there are services in the market that can be integrated easily. The one service that we will discuss more in deep dive is the service discovery. Its primary job is to give the client a list of DNS host names of chat servers that the client could connect to.无状态服务位于负载均衡器后面，负载均衡器的工作是根据请求路径将请求路由到正确的服务。这些服务可以是整体式的，也可以是单独的微服务。我们不需要自己构建许多这样的无状态服务，因为市场上有可以轻松集成的服务。我们将深入讨论的一项服务是服务发现。它的主要工作是向客户端提供客户端可以连接到的聊天服务器的 DNS 主机名列表。

### **Stateful Service 有状态服务**

The only stateful service is the chat service. The service is stateful because each client maintains a persistent network connection to a chat server. In this service, a client normally does not switch to another chat server as long as the server is still available. The service discovery coordinates closely with the chat service to avoid server overloading. We will go into detail in deep dive.唯一有状态的服务是聊天服务。该服务是有状态的，因为每个客户端都与聊天服务器保持持久的网络连接。在此服务中，只要服务器仍然可用，客户端通常不会切换到另一个聊天服务器。服务发现与聊天服务紧密协调，以避免服务器过载。我们将深入探讨细节。

### **Third-party integration 第三方集成**

For a chat app, push notification is the most important third-party integration. It is a way to inform users when new messages have arrived, even when the app is not running. Proper integration of push notification is crucial. Refer to "Design a notification system" chapter for more information.对于聊天应用来说，推送通知是最重要的第三方集成。它是一种在有新消息到达时通知用户的方式，即使应用未运行。正确集成推送通知至关重要。有关更多信息，请参阅“设计通知系统”一章。

### **Scalability 可扩展性**

On a small scale, all services listed above could fit in one server. Even at the scale we design for, it is in theory possible to fit all user connections in one modern cloud server. The number of concurrent connections that a server can handle will most likely be the limiting factor. In our scenario, at 1M concurrent users, assuming each user connection needs 10K of memory on the server (this is a very rough figure and very dependent on the language choice), it only needs about 10GB of memory to hold all the connections on one box.在小规模上，上面列出的所有服务都可以放在一台服务器上。即使在我们设计的规模下，理论上也可以将所有用户连接放在一台现代云服务器中。服务器可以处理的并发连接数很可能是限制因素。在我们的场景中，在 100 万并发用户的情况下，假设每个用户连接需要服务器上 10K 内存（这是一个非常粗略的数字，并且非常依赖于语言选择），它只需要大约 10GB 的内存就可以在一个盒子上容纳所有连接。

If we propose a design where everything fits in one server, this may raise a big red flag in the interviewer’s mind. No technologist would design such a scale in a single server. Single server design is a deal breaker due to many factors. The single point of failure is the biggest among them.如果我们提出的设计是将所有内容都放在一台服务器上，这可能会让面试官产生怀疑。没有技术人员会在一台服务器上设计如此规模的产品。单服务器设计是一个大问题，原因有很多。其中最大的问题是单点故障。

However, it is perfectly fine to start with a single server design. Just make sure the interviewer knows this is a starting point. Putting everything we mentioned together, Figure 8 shows the adjusted high-level design.但是，从单服务器设计开始完全没问题。只要确保面试官知道这是一个起点即可。将我们提到的所有内容放在一起，图 8 显示了调整后的高级设计。

[](data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%27700%27%20height=%27765%27/%3e)

[](https://bytebytego.com/_next/image?url=%2Fimages%2Fcourses%2Fsystem-design-interview%2Fdesign-a-chat-system%2Ffigure-12-8-3R5ORNVB.png&w=1920&q=75)

Figure 8  图 8

In Figure 8, the client maintains a persistent WebSocket connection to a chat server for real-time messaging.在图 8 中，客户端与聊天服务器维持持久的 WebSocket 连接以进行实时消息传递。

- Chat servers facilitate message sending/receiving.聊天服务器促进消息的发送/接收。
- Presence servers manage online/offline status.状态服务器管理在线/离线状态。
- API servers handle everything including user login, signup, change profile, etc.API 服务器处理所有事务，包括用户登录、注册、更改个人资料等。
- Notification servers send push notifications.通知服务器发送推送通知。
- Finally, the key-value store is used to store chat history. When an offline user comes online, she will see all her previous chat history.最后用key-value存储来存储聊天记录，当离线用户上线后，可以看到之前所有的聊天记录。

### **Storage 贮存**

At this point, we have servers ready, services up running and third-party integrations complete. Deep down the technical stack is the data layer. Data layer usually requires some effort to get it correct. An important decision we must make is to decide on the right type of database to use: relational databases or NoSQL databases? To make an informed decision, we will examine the data types and read/write patterns.此时，我们已经准备好服务器、运行服务并完成第三方集成。技术堆栈的深处是数据层。数据层通常需要一些努力才能正确。我们必须做出的一个重要决定是决定使用正确的数据库类型：关系数据库还是 NoSQL 数据库？为了做出明智的决定，我们将检查数据类型和读/写模式。

Two types of data exist in a typical chat system. The first is generic data, such as user profile, setting, user friends list. These data are stored in robust and reliable relational databases. Replication and sharding are common techniques to satisfy availability and scalability requirements.典型的聊天系统中存在两种类型的数据。第一种是通用数据，例如用户个人资料、设置、用户好友列表。这些数据存储在强大而可靠的关系数据库中。复制和分片是满足可用性和可伸缩性要求的常用技术。

The second is unique to chat systems: chat history data. It is important to understand the read/write pattern.第二个是聊天系统独有的：聊天历史数据。了解读写模式很重要。

- The amount of data is enormous for chat systems. A previous study [2] reveals that Facebook messenger and Whatsapp process 60 billion messages a day.对于聊天系统来说，数据量非常巨大。之前的一项研究[2]显示，Facebook Messenger 和 Whatsapp 每天处理 600 亿条消息。
- Only recent chats are accessed frequently. Users do not usually look up for old chats.只经常访问最近的聊天记录。用户通常不会查看旧聊天记录。
- Although very recent chat history is viewed in most cases, users might use features that require random access of data, such as search, view your mentions, jump to specific messages, etc. These cases should be supported by the data access layer.虽然大多数情况下都会查看最近的聊天记录，但用户可能会使用需要随机访问数据的功能，例如搜索、查看您的提及、跳转到特定消息等。数据访问层应该支持这些情况。
- The read to write ratio is about 1:1 for 1 on 1 chat apps.对于一对一聊天应用来说，读写比约为 1:1。

Selecting the correct storage system that supports all of our use cases is crucial. We recommend key-value stores for the following reasons:选择支持所有用例的正确存储系统至关重要。我们推荐使用键值存储，原因如下：

- Key-value stores allow easy horizontal scaling.键值存储可以轻松进行水平扩展。
- Key-value stores provide very low latency to access data.键值存储提供非常低的数据访问延迟。
- Relational databases do not handle long tail [3] of data well. When the indexes grow large, random access is expensive.关系数据库不能很好地处理长尾数据。当索引变得很大时，随机访问的成本会很高。
- Key-value stores are adopted by other proven reliable chat applications. For example, both Facebook messenger and Discord use key-value stores. Facebook messenger uses HBase [4], and Discord uses Cassandra [5].其他经过验证的可靠聊天应用程序也采用了键值存储。例如，Facebook messenger 和 Discord 都使用键值存储。Facebook messenger 使用 HBase [4]，Discord 使用 Cassandra [5]。

# **Data models 数据模型**

Just now, we talked about using key-value stores as our storage layer. The most important data is message data. Let us take a close look.刚才我们谈到了使用键值存储作为我们的存储层。最重要的数据是消息数据。让我们仔细看看。

### **Message table for 1 on 1 chat1 对 1 聊天消息表**

Figure 9 shows the message table for 1 on 1 chat. The primary key is *message_id*, which helps to decide message sequence. We cannot rely on *created_at* to decide the message sequence because two messages can be created at the same time.图 9 显示了 1 对 1 聊天的消息表。主键是*message_id* ，它有助于确定消息顺序。我们不能依赖*created_at*来决定消息顺序，因为可以同时创建两条消息。

[](data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%27335%27%20height=%27292%27/%3e)

[](https://bytebytego.com/_next/image?url=%2Fimages%2Fcourses%2Fsystem-design-interview%2Fdesign-a-chat-system%2Ffigure-12-9-356WMC2A.png&w=750&q=75)

Figure 9  图 9

### **Message table for group chat群聊消息表**

Figure 10 shows the message table for group chat. The composite primary key is *(channel_id, message_id).* Channel and group represent the same meaning here. *channel_id* is the partition key because all queries in a group chat operate in a channel.图10是群聊的消息表，复合主键为*（channel_id，message_id），* channel和group在这里代表同一个意思， *channel_id*是分区键，因为群聊中的所有查询都是在频道中进行操作的。

[](data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%27335%27%20height=%27290%27/%3e)

[](https://bytebytego.com/_next/image?url=%2Fimages%2Fcourses%2Fsystem-design-interview%2Fdesign-a-chat-system%2Ffigure-12-10-2TIQVS3D.png&w=750&q=75)

Figure 10  图 10

### **Message ID 消息 ID**

How to generate *message_id* is an interesting topic worth exploring. *Message_id* carries the responsibility of ensuring the order of messages. To ascertain the order of messages, *message_id* must satisfy the following two requirements:*message_id*如何生成是一个值得探讨*的有趣话题。message_id 承担着保证消息顺序的责任。为了保证消息的顺序，message_id必须*满足以下两个要求：

- IDs must be unique. ID 必须是唯一的。
- IDs should be sortable by time, meaning new rows have higher IDs than old ones.ID 应该可以按时间排序，这意味着新行的 ID 高于旧行。

How can we achieve those two guarantees? The first idea that comes to mind is the “*auto_increment*” keyword in MySql. However, NoSQL databases usually do not provide such a feature.如何才能实现这两个保证？首先想到的是 MySql 中的“ *auto_increment* ”关键字。然而，NoSQL 数据库通常不提供这样的功能。

The second approach is to use a global 64-bit sequence number generator like Snowflake [6]. This is discussed in the “Design a unique ID generator in a distributed system” chapter.第二种方法是使用像 Snowflake [6] 这样的全局 64 位序列号生成器。这在“在分布式系统中设计唯一 ID 生成器”一章中进行了讨论。

The final approach is to use local sequence number generator. Local means IDs are only unique within a group. The reason why local IDs work is that maintaining message sequence within one-on-one channel or a group channel is sufficient. This approach is easier to implement in comparison to the global ID implementation.最后一种方法是使用本地序列号生成器。本地意味着 ID 仅在组内是唯一的。本地 ID 之所以有效，是因为在一对一通道或组通道内维护消息序列就足够了。与全局 ID 实现相比，这种方法更容易实现。

# **Step 3 - Design deep dive第 3 步 - 深入设计**

In a system design interview, usually you are expected to dive deep into some of the components in the high-level design. For the chat system, service discovery, messaging flows, and online/offline indicators worth deeper exploration.在系统设计面试中，通常需要深入研究高级设计中的某些组件。对于聊天系统、服务发现、消息流和在线/离线指标，值得深入探索。

# **Service discovery 服务发现**

The primary role of service discovery is to recommend the best chat server for a client based on the criteria like geographical location, server capacity, etc. Apache Zookeeper [7] is a popular open-source solution for service discovery. It registers all the available chat servers and picks the best chat server for a client based on predefined criteria.服务发现的主要作用是根据地理位置、服务器容量等标准为客户端推荐最佳聊天服务器。Apache Zookeeper [7] 是一种流行的开源服务发现解决方案。它注册所有可用的聊天服务器，并根据预定义的标准为客户端挑选最佳聊天服务器。

Figure 11 shows how service discovery (Zookeeper) works.图 11 显示了服务发现（Zookeeper）的工作原理。

[](data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%27550%27%20height=%27535%27/%3e)

[](https://bytebytego.com/_next/image?url=%2Fimages%2Fcourses%2Fsystem-design-interview%2Fdesign-a-chat-system%2Ffigure-12-11-FGGY42QW.png&w=1200&q=75)

Figure 11  图 11

1. User A tries to log in to the app.1.用户A尝试登录应用程序。

2. The load balancer sends the login request to API servers.2. 负载均衡器将登录请求发送至 API 服务器。

3. After the backend authenticates the user, service discovery finds the best chat server for User A. In this example, server 2 is chosen and the server info is returned back to User A.3. 后端对用户进行身份验证后，服务发现会为用户 A 找到最佳聊天服务器。在此示例中，选择了服务器 2，并将服务器信息返回给用户 A。

4. User A connects to chat server 2 through WebSocket.4.用户A通过WebSocket连接聊天服务器2。

# **Message flows 消息流**

It is interesting to understand the end-to-end flow of a chat system. In this section, we will explore 1 on 1 chat flow, message synchronization across multiple devices and group chat flow.了解聊天系统的端到端流程很有趣。在本节中，我们将探索一对一聊天流程、跨多设备的消息同步和群聊流程。

### **1 on 1 chat flow1 对 1 聊天流程**

Figure 12 explains what happens when User A sends a message to User B.图 12 解释了当用户 A 向用户 B 发送消息时发生的情况。

[](data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%27500%27%20height=%27530%27/%3e)

[](https://bytebytego.com/_next/image?url=%2Fimages%2Fcourses%2Fsystem-design-interview%2Fdesign-a-chat-system%2Ffigure-12-12-5BTRQZRL.png&w=1080&q=75)

Figure 12  图 12

1. User A sends a chat message to Chat server 1.1. 用户A向聊天服务器1发送聊天消息。

2. Chat server 1 obtains a message ID from the ID generator.2. 聊天服务器1从ID生成器获取消息ID。

3. Chat server 1 sends the message to the message sync queue.3.聊天服务器1将消息发送到消息同步队列。

4. The message is stored in a key-value store.4. 消息存储在键值存储中。

5.a. If User B is online, the message is forwarded to Chat server 2 where User B is connected.5.a. 如果用户 B 在线，则消息被转发到用户 B 所连接的聊天服务器 2。

5.b. If User B is offline, a push notification is sent from push notification (PN) servers.5.b. 如果用户 B 离线，则从推送通知 (PN) 服务器发送推送通知。

6. Chat server 2 forwards the message to User B. There is a persistent WebSocket connection between User B and Chat server 2.6. 聊天服务器 2 将消息转发给用户 B。用户 B 和聊天服务器 2 之间存在持久的 WebSocket 连接。

### **Message synchronization across multiple devices多设备消息同步**

Many users have multiple devices. We will explain how to sync messages across multiple devices. Figure 13 shows an example of message synchronization.很多用户都有多台设备，下面我们来介绍如何在多台设备间同步消息。图13是消息同步的示例。

[](data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%27600%27%20height=%27426%27/%3e)

[](https://bytebytego.com/_next/image?url=%2Fimages%2Fcourses%2Fsystem-design-interview%2Fdesign-a-chat-system%2Ffigure-12-13-YB54XAJ3.png&w=1200&q=75)

Figure 13  图 13

In Figure 13, user A has two devices: a phone and a laptop. When User A logs in to the chat app with her phone, it establishes a WebSocket connection with Chat server 1. Similarly, there is a connection between the laptop and Chat server 1.在图 13 中，用户 A 有两台设备：一部手机和一台笔记本电脑。当用户 A 使用手机登录聊天应用程序时，它会与聊天服务器 1 建立 WebSocket 连接。同样，笔记本电脑和聊天服务器 1 之间也有一个连接。

Each device maintains a variable called *cur_max_message_id*, which keeps track of the latest message ID on the device. Messages that satisfy the following two conditions are considered as news messages:每个设备都会维护一个名为*cur_max_message_id*的变量，用于跟踪设备上的最新消息 ID。满足以下两个条件的消息将被视为新闻消息：

- The recipient ID is equal to the currently logged-in user ID.收件人ID等于当前登录的用户ID。
- Message ID in the key-value store is larger than *cur_max_message_id*.键值存储中的消息 ID 大于*cur_max_message_id* 。

With distinct *cur_max_message_id* on each device, message synchronization is easy as each device can get new messages from the KV store.由于每台设备上具有不同的*cur_max_message_id* ，因此消息同步变得容易，因为每台设备都可以从 KV 存储中获取新消息。

### **Small group chat flow 小组聊天流程**

In comparison to the one-on-one chat, the logic of group chat is more complicated. Figures 12-14 and 12-15 explain the flow.相较于单聊，群聊的逻辑更加复杂，图12-14和图12-15解释了群聊的流程。

[](data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%27500%27%20height=%27435%27/%3e)

[](https://bytebytego.com/_next/image?url=%2Fimages%2Fcourses%2Fsystem-design-interview%2Fdesign-a-chat-system%2Ffigure-12-14-DRZR5QM7.png&w=1080&q=75)

Figure 14  图 14

Figure 14 explains what happens when User A sends a message in a group chat. Assume there are 3 members in the group (User A, User B and user C). First, the message from User A is copied to each group member’s message sync queue: one for User B and the second for User C. You can think of the message sync queue as an inbox for a recipient. This design choice is good for small group chat because:图 14 解释了当用户 A 在群聊中发送消息时会发生什么。假设群组中有 3 名成员（用户 A、用户 B 和用户 C）。首先，来自用户 A 的消息被复制到每个群组成员的消息同步队列：一个给用户 B，另一个给用户 C。您可以将消息同步队列视为收件人的收件箱。这种设计选择适用于小型群聊，因为：

- it simplifies message sync flow as each client only needs to check its own inbox to get new messages.它简化了消息同步流程，因为每个客户端只需要检查自己的收件箱即可获取新消息。
- when the group number is small, storing a copy in each recipient’s inbox is not too expensive.当群组人数较少时，在每个收件人的收件箱中存储一份副本的成本并不太高。

WeChat uses a similar approach, and it limits a group to 500 members [8]. However, for groups with a lot of users, storing a message copy for each member is not acceptable.微信采用了类似的方法，并将群组限制为 500 名成员 [8]。然而，对于拥有大量用户的群组来说，为每个成员保存消息副本是不可接受的。

On the recipient side, a recipient can receive messages from multiple users. Each recipient has an inbox (message sync queue) which contains messages from different senders. Figure 15 illustrates the design.在接收方，一个接收者可以接收来自多个用户的消息。每个接收者都有一个收件箱（消息同步队列），其中包含来自不同发送者的消息。图 15 说明了该设计。

[](data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%27500%27%20height=%27435%27/%3e)

[](https://bytebytego.com/_next/image?url=%2Fimages%2Fcourses%2Fsystem-design-interview%2Fdesign-a-chat-system%2Ffigure-12-15-WJ6BSAG2.png&w=1080&q=75)

Figure 15  图 15

# **Online presence 在线状态**

An online presence indicator is an essential feature of many chat applications. Usually, you can see a green dot next to a user’s profile picture or username. This section explains what happens behind the scenes.在线状态指示器是许多聊天应用程序的必备功能。通常，您可以在用户的个人资料图片或用户名旁边看到一个绿点。本节介绍幕后发生的事情。

In the high-level design, presence servers are responsible for managing online status and communicating with clients through WebSocket. There are a few flows that will trigger online status change. Let us examine each of them.在高层设计中，在线状态服务器负责管理在线状态并通过 WebSocket 与客户端通信。有几个流程会触发在线状态更改。让我们逐一检查一下。

### **User login 用户登录**

The user login flow is explained in the “Service Discovery” section. After a WebSocket connection is built between the client and the real-time service, user A’s online status and *last_active_at* timestamp are saved in the KV store. Presence indicator shows the user is online after she logs in.用户登录流程在“服务发现”部分中进行了说明。在客户端和实时服务之间建立 WebSocket 连接后，用户 A 的在线状态和*last_active_at*时间戳将保存在 KV 存储中。用户登录后，在线状态指示器显示用户在线。

[](data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%27500%27%20height=%27128%27/%3e)

[](https://bytebytego.com/_next/image?url=%2Fimages%2Fcourses%2Fsystem-design-interview%2Fdesign-a-chat-system%2Ffigure-12-16-IUZRWUV6.png&w=1080&q=75)

Figure 16  图 16

### **User logout 用户注销**

When a user logs out, it goes through the user logout flow as shown in Figure 17. The online status is changed to offline in the KV store. The presence indicator shows a user is offline.当用户注销时，它会经历如图 17 所示的用户注销流程。在线状态在 KV 存储中更改为离线。在线指示器显示用户处于离线状态。

[](data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%27600%27%20height=%27122%27/%3e)

[](https://bytebytego.com/_next/image?url=%2Fimages%2Fcourses%2Fsystem-design-interview%2Fdesign-a-chat-system%2Ffigure-12-17-GJTW7H57.png&w=1200&q=75)

Figure 17  图 17

### **User disconnection 用户断线**

We all wish our internet connection is consistent and reliable. However, that is not always the case; thus, we must address this issue in our design. When a user disconnects from the internet, the persistent connection between the client and server is lost. A naive way to handle user disconnection is to mark the user as offline and change the status to online when the connection re-establishes. However, this approach has a major flaw. It is common for users to disconnect and reconnect to the internet frequently in a short time. For example, network connections can be on and off while a user goes through a tunnel. Updating online status on every disconnect/reconnect would make the presence indicator change too often, resulting in poor user experience.我们都希望我们的互联网连接始终稳定可靠。然而，情况并非总是如此；因此，我们必须在设计中解决这个问题。当用户断开互联网连接时，客户端和服务器之间的持久连接就会丢失。处理用户断开连接的一种简单方法是将用户标记为离线，并在重新建立连接时将状态更改为在线。然而，这种方法有一个重大缺陷。用户经常会在短时间内频繁断开和重新连接到互联网。例如，当用户通过隧道时，网络连接可能会打开和关闭。每次断开/重新连接时更新在线状态会导致在线状态指示器更改过于频繁，从而导致糟糕的用户体验。

We introduce a heartbeat mechanism to solve this problem. Periodically, an online client sends a heartbeat event to presence servers. If presence servers receive a heartbeat event within a certain time, say x seconds from the client, a user is considered as online. Otherwise, it is offline.我们引入了心跳机制来解决这个问题。在线客户端会定期向在线状态服务器发送心跳事件。如果在线状态服务器在一定时间内（例如 x 秒）收到来自客户端的心跳事件，则认为用户在线。否则，用户处于离线状态。

In Figure 18, the client sends a heartbeat event to the server every 5 seconds. After sending 3 heartbeat events, the client is disconnected and does not reconnect within x = 30 seconds (This number is arbitrarily chosen to demonstrate the logic). The online status is changed to offline.在图 18 中，客户端每 5 秒向服务器发送一次心跳事件。发送 3 次心跳事件后，客户端断开连接，并且在 x = 30 秒内未重新连接（此数字是任意选择的，以演示逻辑）。在线状态更改为离线。

[](data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%27700%27%20height=%27558%27/%3e)

![](https://bytebytego.com/images/courses/system-design-interview/design-a-chat-system/figure-12-18-CTDI4PAJ.svg)

Figure 18  图 18

### **Online status fanout 在线状态扇出**

How do user A’s friends know about the status changes? Figure 19 explains how it works. Presence servers use a publish-subscribe model, in which each friend pair maintains a channel. When User A’s online status changes, it publishes the event to three channels, channel A-B, A-C, and A-D. Those three channels are subscribed by User B, C, and D, respectively. Thus, it is easy for friends to get online status updates. The communication between clients and servers is through real-time WebSocket.用户 A 的好友如何知道状态变化？图 19 解释了其工作原理。状态服务器使用发布-订阅模型，其中每对好友维护一个频道。当用户 A 的在线状态发生变化时，它会将事件发布到三个频道，即频道 AB、AC 和 AD。这三个频道分别由用户 B、C 和 D 订阅。因此，好友可以轻松获取在线状态更新。客户端和服务器之间的通信是通过实时 WebSocket 进行的。

[](data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%27600%27%20height=%27281%27/%3e)

[](https://bytebytego.com/_next/image?url=%2Fimages%2Fcourses%2Fsystem-design-interview%2Fdesign-a-chat-system%2Ffigure-12-19-KY63S3WN.png&w=1200&q=75)

Figure 19  图 19

The above design is effective for a small user group. For instance, WeChat uses a similar approach because its user group is capped to 500. For larger groups, informing all members about online status is expensive and time consuming. Assume a group has 100,000 members. Each status change will generate 100,000 events. To solve the performance bottleneck, a possible solution is to fetch online status only when a user enters a group or manually refreshes the friend list.上述设计对于小规模的用户群是有效的。例如，微信就采用了类似的方法，因为其用户群上限为 500 人。对于较大的群组，通知所有成员在线状态既昂贵又耗时。假设一个群组有 100,000 名成员。每次状态更改都会生成 100,000 个事件。为了解决性能瓶颈，一种可能的解决方案是仅在用户进入群组或手动刷新好友列表时获取在线状态。

# **Step 4 - Wrap up第 4 步 - 总结**

In this chapter, we presented a chat system architecture that supports both 1-to-1 chat and small group chat. WebSocket is used for real-time communication between the client and server. The chat system contains the following components: chat servers for real-time messaging, presence servers for managing online presence, push notification servers for sending push notifications, key-value stores for chat history persistence and API servers for other functionalities.在本章中，我们介绍了一种支持一对一聊天和小组聊天的聊天系统架构。WebSocket 用于客户端和服务器之间的实时通信。聊天系统包含以下组件：用于实时消息传递的聊天服务器、用于管理在线状态的状态服务器、用于发送推送通知的推送通知服务器、用于聊天历史记录持久化的键值存储和用于其他功能的 API 服务器。

If you have extra time at the end of the interview, here are additional talking points:如果面试结束时您还有空闲时间，以下是补充谈话要点：

- Extend the chat app to support media files such as photos and videos. Media files are significantly larger than text in size. Compression, cloud storage, and thumbnails are interesting topics to talk about.扩展聊天应用程序以支持照片和视频等媒体文件。媒体文件的大小明显大于文本。压缩、云存储和缩略图是值得讨论的有趣话题。
- End-to-end encryption. Whatsapp supports end-to-end encryption for messages. Only the sender and the recipient can read messages. Interested readers should refer to the article in the reference materials [9].端到端加密。Whatsapp 支持消息的端到端加密。只有发送者和接收者可以阅读消息。感兴趣的读者可以参阅参考资料中的文章 [9]。
- Caching messages on the client-side is effective to reduce the data transfer between the client and server.在客户端缓存消息可以有效减少客户端和服务器之间的数据传输。
- Improve load time. Slack built a geographically distributed network to cache users’ data, channels, etc. for better load time [10].缩短加载时间。Slack 建立了一个地理分布的网络来缓存用户的数据、频道等，以缩短加载时间 [10]。
- Error handling. 错误处理。
- The chat server error. There might be hundreds of thousands, or even more persistent connections to a chat server. If a chat server goes offline, service discovery (Zookeeper) will provide a new chat server for clients to establish new connections with.聊天服务器错误。聊天服务器可能有数十万个甚至更多的持久连接。如果聊天服务器离线，服务发现 (Zookeeper) 将为客户端提供一个新的聊天服务器以建立新连接。
- Message resent mechanism. Retry and queueing are common techniques for resending messages.消息重发机制。重试和排队是重发消息的常用技术。

Congratulations on getting this far! Now give yourself a pat on the back. Good job!恭喜你走到这一步！现在给自己一点鼓励吧。干得好！

# **Reference materials 参考资料**

[1] Erlang at Facebook:  [1] Facebook 的 Erlang：

[https://www.erlang-factory.com/upload/presentations/31/EugeneLetuchy-ErlangatFacebook.pdf](https://www.erlang-factory.com/upload/presentations/31/EugeneLetuchy-ErlangatFacebook.pdf)

[2] Messenger and WhatsApp process 60 billion messages a day:[2] Messenger 和 WhatsApp 每天处理 600 亿条消息：[https://www.theverge.com/2016/4/12/11415198/facebook-messenger-whatsapp-number-messages-vs-sms-f8-2016](https://www.theverge.com/2016/4/12/11415198/facebook-messenger-whatsapp-number-messages-vs-sms-f8-2016)

[3] Long tail: [https://en.wikipedia.org/wiki/Long_tail](https://en.wikipedia.org/wiki/Long_tail)[3] 长尾： [https://en.wikipedia.org/wiki/Long_tail](https://en.wikipedia.org/wiki/Long_tail)

[4] The Underlying Technology of Messages:[4] 信息的底层技术：[https://www.facebook.com/notes/facebook-engineering/the-underlying-technology-of-messages/454991608919/](https://www.facebook.com/notes/facebook-engineering/the-underlying-technology-of-messages/454991608919/)

[5] How Discord Stores Billions of Messages:[5] Discord 如何存储数十亿条消息：[https://blog.discordapp.com/how-discord-stores-billions-of-messages-7fa6ec7ee4c7](https://blog.discordapp.com/how-discord-stores-billions-of-messages-7fa6ec7ee4c7)

[6] Announcing Snowflake: [https://blog.twitter.com/engineering/en_us/a/2010/announcing-snowflake.html](https://blog.twitter.com/engineering/en_us/a/2010/announcing-snowflake.html)[6] 宣布 Snowflake： [https://blog.twitter.com/engineering/en_us/a/2010/announcing-snowflake.html](https://blog.twitter.com/engineering/en_us/a/2010/announcing-snowflake.html)

[7] Apache ZooKeeper: [https://zookeeper.apache.org/](https://zookeeper.apache.org/)[7]Apache ZooKeeper： [https://zookeeper.apache.org/](https://zookeeper.apache.org/)

[8] From nothing: the evolution of WeChat background system (Article in Chinese):[8] 从无到有：微信后台系统的演进：[https://www.infoq.cn/article/the-road-of-the-growth-weixin-background](https://www.infoq.cn/article/the-road-of-the-growth-weixin-background)

[9] End-to-end encryption: [https://faq.whatsapp.com/en/android/28030015/](https://faq.whatsapp.com/en/android/28030015/)
