---
title: "Real-Time Bidding Engine"
description: "A high-throughput DSP bidding system with ML model serving, multi-stage ad filtering, and adaptive budget pacing."
date: 2025-06-01
cover: "/images/projects/project-3.jpg"
tags: [Go, algorithms, advertising]
featured: true
order: 3
---

The core engine behind a programmatic advertising platform, handling millions of bid requests per day across multiple ad exchanges. Built in Go with a 30+ filter matching pipeline, CTR/CVR prediction via TensorFlow Serving, and a three-level budget control system with K-factor optimization. Supports multi-region deployment, AB experimentation at the model and strategy level, and real-time funnel analytics through structured logging and Prometheus metrics.
