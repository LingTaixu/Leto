---
title: "CATL Safety Platform: Linkage and Performance Optimization of a Complex Form with 200+ Fields"
summary: "In B2B reliability and safety system development, how do you solve the lag caused by forms with over 200 fields and high-frequency linkage validation? An in-depth retrospective of a technical path based on React + Umi and dynamic form refactoring."
date: "2026-08-10"
tags: ["react","frontend","性能优化"]
readMin: 8
---

## The Challenge

In CATL's Reliability and Safety department, massive amounts of process and operating parameters exported from precision production-line machinery needed to be intuitively presented and submitted 0-to-1 into the Web safety system platform. The core of the system is a **dynamic complex mega-form** used for equipment safety-level and risk assessment: - more than 200 fields; - dense "parent-child linkage" (e.g., when modifying the temperature of Process A, the 12 risk-level parameters beneath it must be recalculated and highlighted); - form lag slices the data-entry efficiency of production-line safety inspectors in half.

## Technical Diagnosis of Performance Bottlenecks

The initial approach used conventional full-state-driven rendering; every input triggered a re-render of the entire form component tree (Reflow & Re-render). When the field count exceeded 150, the Input keystroke response latency (FID) soared past **280ms**, with visibly perceptible lag.

## Performance Optimization Strategy

### 1. Subscription-Based Uncontrolled Form (Reactive Form Store)

We atomized the form system. Using a publish/subscribe pattern, form data is hosted in an independent in-memory Store. Each input component (Input/Select/Radio) only subscribes to its corresponding field Key; only when a linked downstream field needs to change does the global Event Bus dispatch an event for precise, localized rendering:

```
// 订阅制表单原子组件
export function AtomicInput({ fieldKey }) {
  const [value, setValue] = useFormValue(fieldKey); // 只订阅当前 fieldKey
  return <input value={value} onChange={e => setValue(e.target.value)} />;
}
```

Through this refactor, the single-keystroke Re-render scope during full-field linkage shrank from 200+ to a precise 1-3, and **FID latency dropped from 280ms to just 12ms**, completely eliminating the sticky-keystroke feel.

### 2. Process Data Linkage and ECharts Visualization

To meet real-time monitoring requirements, the form submission triggers real-time plotting of process data charts. We use **ECharts** to draw precise multi-axis operating curves, and implemented a "risk-level dynamic color-changing bar chart" so the safety department can pinpoint faulty machines at a glance.

## Summary

In enterprise-level platform applications facing extreme form scenarios, **"divide-and-conquer subscription, uncontrolled rendering, and highly reusable common components"** are the core optimization truth. By encapsulating highly abstract, generic form components, we not only delivered an extremely smooth system but also established a standard UI foundation library for the safety department's future outsourced projects and sibling-platform development.