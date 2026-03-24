# AI-Powered File Organisation and Management Tool

![Status](https://img.shields.io/badge/Status-Active-success)
![AI](https://img.shields.io/badge/Architecture-AI--Ready-orange)
![Frontend](https://img.shields.io/badge/Frontend-React-blue)
![UI](https://img.shields.io/badge/UI-TailwindCSS-38bdf8)

## Overview

An intelligent file management system that introduces automated organization, content-aware retrieval, and AI-driven file understanding into traditional file workflows.

Instead of depending only on folders and manual naming conventions, this system follows a pipeline-driven approach where files are processed, categorized, enriched with metadata, and retrieved through structured search.

## Problem Statement

Modern file systems often suffer from:

- Unorganized file structures
- Time-consuming manual sorting
- Search limited to file names
- Difficulty in locating important files
- Reduced productivity due to inefficient file retrieval

## Solution

This system introduces an intelligent layer that:

- Automatically categorizes files
- Extracts useful metadata
- Enables content-aware search
- Supports structured retrieval
- Improves file accessibility and usability

## System Workflow

```text
Upload → Process → Categorize → Generate Metadata → Store → Index → Search → Retrieve
Detailed Processing Pipeline
[ User Upload ]
      ↓
[ File Ingestion ]
      ↓
[ File Type Detection ]
      ↓
[ Content Extraction ]
 (Text / DOCX / Image / PDF)
      ↓
[ Processing Layer ]
      ↓
[ Categorization Engine ]
      ↓
[ Metadata Generation ]
 (Tags / Keywords / Summary)
      ↓
[ Storage Layer ]
 (LocalStorage)
      ↓
[ Indexing ]
      ↓
[ Search Engine ]
      ↓
[ Result Ranking ]
      ↓
[ UI Display + Preview ]
Core Features
Multi-file upload and management
Smart search using content, metadata, tags, and keywords
Intelligent categorization system
Automatic tag and keyword generation
File preview for images, text, and PDF
File delete and download functionality
Fast filtering with responsive UI
Intelligent Search System

The search system supports multiple matching layers:

File name matching
Content-based matching
Tag-based filtering
Keyword indexing

This improves retrieval quality compared to traditional file systems that depend mainly on filenames.

AI Capability
Implemented in the Current System
Content-based categorization
Keyword extraction
Metadata generation
Multi-layer search logic
File-type-aware processing
AI-Oriented Design for Extension
NLP-based semantic search
ML-based file classification
Context-aware ranking
Recommendation systems
AI Processing Flow
Input File
     ↓
Preprocessing
     ↓
Feature Extraction (TF-IDF / Embeddings)
     ↓
Classification Model
     ↓
Semantic Indexing
     ↓
Query Processing
     ↓
Similarity Matching
     ↓
Ranked Results
Design Approach

The system is designed using a pipeline-based architecture, where each stage handles a specific responsibility:

ingestion
processing
categorization
metadata generation
indexing
retrieval

This approach improves modularity, maintainability, and future scalability.

Technology Stack
Frontend
React
Vite
Tailwind CSS
Lucide React
File Processing
Mammoth.js for DOCX extraction
FileReader API for browser-based file handling
Storage
Browser LocalStorage
Runtime and Extension Layer
Node.js ecosystem
Python planned for future ML and NLP backend services
System Characteristics
Modular pipeline architecture
Scalable design
AI-ready structure
Lightweight and fast
Privacy-focused local execution
Extensible for future backend integration
Impact
Reduces file search time
Eliminates manual file organization effort
Improves productivity
Enables structured file understanding
Provides a strong foundation for intelligent file management
Future Enhancements
NLP-based semantic search
Image recognition models
AI summarization
Voice-based search
Cloud integration with AWS or Google Drive
Backend services using Python and FastAPI
ML-based ranking and recommendation engine
Key Insight

This system shifts file management from manual organization to intelligent, automated understanding.

Contributors
Manoj K.P
Amul Raj
Bhuvan
Srajan
