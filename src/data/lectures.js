export const LECTURES = [
  {
    id: 1,
    number: '01',
    title: 'Traditional NLP to Neural Sequence Models',
    subtitle: 'RNNs, LSTMs, Word2Vec, GloVe, Seq2Seq',
    content: `
Lecture 1: From Traditional NLP to Neural Sequence Models

KEY CONCEPTS AND TERMS:
- Rule-Based NLP: Hand-written if-then rules, struggled with ambiguity and scalability
- Statistical NLP: N-grams, probabilistic models, HMMs — limited by fixed context windows and data sparsity
- Word Embeddings: Dense vectors capturing semantic meaning. Words with similar meanings are geometrically closer.
- Word2Vec: Skip-gram (predicts context from target word, better for rare words) and CBOW (predicts target from context words)
- GloVe (Global Vectors): Leverages global co-occurrence statistics across entire corpus
- Vector arithmetic: king - man + woman = queen (semantic relationships encoded in vectors)
- RNN (Recurrent Neural Network): Shared weights across time, hidden state as memory, trained via BPTT (Backpropagation Through Time)
- Vanishing gradient problem: Gradients shrink exponentially through time — RNNs forget distant context
- Exploding gradient problem: Gradients grow uncontrollably, causing unstable training
- LSTM (Long Short-Term Memory): Addresses vanishing gradients through gating mechanisms
  - Forget Gate: decides what to discard from cell state using sigmoid
  - Input Gate: decides what new info to store using sigmoid + tanh
  - Output Gate: controls what part of cell state becomes output
- Cell state: LSTM's long-term memory track
- Seq2Seq (Sequence-to-Sequence): Encoder-decoder architecture. Encoder compresses input to context vector; decoder generates output token by token
- Information Bottleneck: Entire input must be compressed into fixed-size context vector — causes information loss for long sequences
- Encoder: RNN/LSTM that reads input and produces context vector (last hidden state)
- Decoder: RNN/LSTM that generates output sequence using context vector

KEY COMPARISONS:
- N-gram: High parallelization, poor long dependencies, suffers curse of dimensionality
- RNN: Low parallelization (sequential), limited long dependencies, vanishing/exploding gradients
- LSTM: Low parallelization, improved long dependencies, expensive computation
- Seq2Seq: Attention improves on bottleneck, but sequential internally

CRITICAL INSIGHTS:
- Transformers solve RNN's sequential bottleneck (like everyone hearing everyone instantly vs whispering in a line)
- LSTMs slow gradient decay but don't eliminate the problem for very long sequences
- The information bottleneck in Seq2Seq is solved by attention mechanisms
`.trim()
  },
  {
    id: 2,
    number: '02',
    title: 'Transformers',
    subtitle: 'Self-Attention, Multi-Head Attention, Positional Encoding',
    content: `
Lecture 2: Transformers

KEY CONCEPTS AND TERMS:
- Transformer: Neural architecture based entirely on attention mechanisms, introduced in "Attention Is All You Need" (Vaswani et al., 2017)
- Self-Attention: Each token attends to every other token in the sequence simultaneously — captures long-range dependencies in one step
- Query (Q), Key (K), Value (V): Three matrices derived from input. Attention score = softmax(QK^T / sqrt(d_k)) * V
- Scaled Dot-Product Attention: Divides by sqrt(d_k) to prevent gradient vanishing from large dot products
- Multi-Head Attention: Multiple attention heads in parallel, each learning different types of relationships (syntax, coreference, semantics)
- Positional Encoding: Injects position information using sine and cosine functions at different frequencies — no recurrence so position must be explicit
- Feed-Forward Network: Position-wise MLP applied to each token's representation after attention
- Layer Normalization: Applied to each sub-layer output for training stability
- Residual Connections: Skip connections around each sub-layer, enabling deep networks
- Encoder Stack: Multiple encoder layers (each = self-attention + feed-forward)
- Decoder Stack: Multiple decoder layers (each = masked self-attention + cross-attention + feed-forward)
- Cross-Attention: Decoder attends to encoder outputs to incorporate source context
- Causal (Masked) Masking: Prevents decoder from attending to future tokens during training

ARCHITECTURE:
- Input → Token Embedding + Positional Encoding → N Encoder Layers → Encoder Output
- (Target) → Masked Self-Attention → Cross-Attention (with encoder output) → Feed-Forward → Output Probabilities
- BERT uses encoder-only, GPT uses decoder-only, T5 uses full encoder-decoder

KEY APPLICATIONS:
- Machine Translation, Text Classification, Question Answering, Named Entity Recognition
- Text Summarization, Sentiment Analysis, Speech Recognition

WHY TRANSFORMERS BEAT RNNs:
- Parallel computation (no sequential dependency)
- Direct connections between any two positions (O(1) path length vs O(n) for RNNs)
- No vanishing gradient across positions
- Better scaling with data and compute

PRE-TRAINED MODELS:
- BERT (bidirectional encoder), GPT (autoregressive decoder), RoBERTa, T5, XLNet
- Hugging Face Transformers library provides easy access
`.trim()
  },
  {
    id: 3,
    number: '03',
    title: 'Seq2Seq & Attention Mechanism',
    subtitle: 'Encoder-Decoder, Attention, Information Bottleneck',
    content: `
Lecture 3: Sequence-to-Sequence Models & Attention Mechanism

KEY CONCEPTS AND TERMS:
- Seq2Seq model: Maps input sequence to output sequence using encoder-decoder RNNs. Google Translate adopted it in 2016.
- Applications: Machine translation, text summarization, dialogue systems, image captioning, speech recognition
- Encoder RNN: Processes each input token, compresses entire sequence into context vector (last hidden state)
- Context Vector: Fixed-size numerical representation of entire input. Typical size: 256, 512, or 1024 dimensions
- Decoder RNN: Generates output tokens one at a time using context vector as initial state
- Teacher Forcing: During training, use actual previous token as decoder input (not predicted)
- Word Embeddings in Seq2Seq: Words converted to vectors before processing — captures semantic meaning

SEQ2SEQ LIMITATIONS:
- Fixed-Length Context: One vector to represent any-length input — information loss for long sequences
- Information Bottleneck: Must compress everything before decoding begins
- No Alignment: No explicit modeling of which input words relate to each output word
- Limited Context Awareness: Decoder can't selectively focus on input parts
- Varying Length Outputs: Challenging to handle outputs of unpredictable length

ATTENTION MECHANISM:
- Solves the bottleneck by letting the decoder look at ALL encoder hidden states at each decoding step
- Alignment Scores: Computed between current decoder state and each encoder hidden state
- Softmax weights: Normalize scores to create a probability distribution over input positions
- Context Vector (with attention): Weighted sum of all encoder hidden states — dynamic, not fixed
- The decoder at each step creates its own "personalized" context vector

ATTENTION FLOW:
1. Encoder produces hidden state at each input position (h1, h2, ..., hn)
2. At decoding step t: compute score(decoder_state, h_i) for each encoder position i
3. Apply softmax to get attention weights α_i
4. Compute weighted context: c_t = Σ α_i * h_i
5. Decoder uses c_t + previous output to predict next token

BEFORE vs AFTER ATTENTION:
- Before: Single fixed context vector → decoder struggles with long sequences
- After: Dynamic context at each step → decoder focuses on relevant input parts
- Result: Dramatically improved translation quality, especially for long sentences
`.trim()
  },
  {
    id: 4,
    number: '04',
    title: 'Pretraining Paradigm & Foundation Models',
    subtitle: 'Self-Supervised Learning, Scaling Laws, Fine-Tuning',
    content: `
Lecture 4: Pretraining Paradigm & Foundation Models

KEY CONCEPTS AND TERMS:
- Foundation Model: Any model trained on broad data at scale that can be adapted to a wide range of downstream tasks (Bommasani et al., 2021)
- Pretraining: Phase 1 — train on massive unlabeled data via self-supervised objectives to learn general representations
- Fine-Tuning: Phase 2 — adapt pre-trained model to specific downstream task using smaller labeled dataset
- Self-Supervised Learning: Model generates its own supervisory signal from unlabeled data — no human labels needed
- Next-Token Prediction: Primary LLM training objective — predict the next word given all preceding words
- Probability Distribution: Model outputs likelihood of each vocabulary word being next
- Loss Minimization: Adjust parameters to reduce cross-entropy between predicted and actual distributions
- Base Model: Result of pretraining — knows a lot but doesn't follow instructions well
- Instruction Tuning: Fine-tuning technique training models to follow human instructions (prompt-response format)
- RLHF (Reinforcement Learning from Human Feedback): Aligns models with human preferences via reward modeling

TRADITIONAL NLP vs FOUNDATION MODELS:
- Traditional: Task-specific architectures, expensive labeled data, poor generalization
- Foundation: One base model, unlabeled data, adapts to many tasks

THE UNIFIED AI PIPELINE:
1. Unstructured Data Collection (web, books, code) → 45+ Petabytes
2. Self-Supervised Pretraining (learns language patterns)
3. Base Foundation Model (knows language, lacks instruction-following)
4. Fine-Tuning / Instruction Tuning / RLHF (alignment and specialization)
5. Deployment

WHAT EMERGES FROM NEXT-TOKEN PREDICTION:
- Syntax & Grammar: grammatical rules and sentence structure
- Semantics & Meaning: word relationships and contextual meaning
- Reasoning & Logic: implicit inference and coherent argumentation

SCALING LAWS:
- Performance improves as a Power Law with: Compute (FLOPs), Dataset Size (tokens), Model Size (parameters)
- GPT-2 (1.5B params) → GPT-3 (175B params): emergent capabilities appear (few-shot learning, reasoning)
- Emergent properties: abilities not present in smaller models that appear suddenly at scale

FOUNDATION MODEL ECOSYSTEM:
- GPT-4 (OpenAI): versatile, drives ChatGPT
- Claude (Anthropic): Constitutional AI, safety-focused
- Gemini (Google): multimodal capabilities
- LLaMA (Meta): open-weights, research-friendly

RISKS:
- Hallucinations: confident but incorrect outputs — especially dangerous in medicine/law
- Bias: reflects biases in training data
- Interpretability: difficult to explain why model says what it says
`.trim()
  },
  {
    id: 5,
    number: '05',
    title: 'BERT: Encoder-Only Model Deep Dive',
    subtitle: 'Bidirectional Context, MLM, NSP, Fine-Tuning',
    content: `
Lecture 5: BERT — Bidirectional Encoder Representations from Transformers

KEY CONCEPTS AND TERMS:
- BERT: Bidirectional Encoder Representations from Transformers. Google AI, 2018. NAACL 2019 Best Paper.
- Encoder-Only: Uses only the Transformer encoder stack — captures context from both directions simultaneously
- Bidirectional Context: Reads left AND right context at every layer. Unlike GPT (left-to-right) or ELMo (two separate LSTMs)
- MLM (Masked Language Modeling): 15% of tokens randomly masked; model predicts them using full bidirectional context
- 80-10-10 Strategy: 80% replaced with [MASK], 10% replaced with random word, 10% left unchanged
- NSP (Next Sentence Prediction): Model classifies if sentence B actually follows sentence A (IsNext / NotNext)
- [CLS] token: Special token at start; its final hidden state used for sentence-level classification
- [SEP] token: Separates sentence pairs
- [MASK] token: Replaces masked tokens during MLM pre-training
- WordPiece tokenization: Subword tokenization (e.g., "Transformerify" → "Transformer" + "##ify")

THREE EMBEDDINGS (summed as input):
- Token Embedding: WordPiece subword representation
- Segment Embedding: Marks sentence A vs sentence B (E_A or E_B)
- Position Embedding: Learned positional information

BERT SIZES:
- BERT-Base: 12 encoder layers, 768 hidden, 12 attention heads, 110M parameters
- BERT-Large: 24 encoder layers, 1024 hidden, 16 attention heads, 340M parameters
- Trained on: Wikipedia (2.5B words) + BooksCorpus (0.8B words), 1M steps, max 512 tokens

FINE-TUNING TASKS:
- Sentence-Level: use [CLS] token → linear classifier (MNLI, QQP, SST-2, MRPC, RTE)
- Token-Level: use each token's vector → per-token classifier (NER, SQuAD extractive QA)

RESULTS:
- GLUE: BERT-Large 82.1 avg (vs GPT 75.1)
- SQuAD: BERT-Large ensemble 93.2 F1 (beats human 91.2)

CRITICAL THINKING:
- Why NSP was removed (RoBERTa): task too easy, topic cues solved it, didn't improve downstream performance
- Why BERT can't generate text: trained non-autoregressively with future token access; generation requires left-to-right sequential prediction with no future peeking
- Why decoder-only LLMs dominate now: autoregressive generation, 100% token training efficiency (vs BERT's 15%), scalable, unified tasks
`.trim()
  },
  {
    id: 6,
    number: '06',
    title: 'GPT Evolution: Decoder-Only Models',
    subtitle: 'Autoregressive Generation, Causal Masking, Scaling, RLHF',
    content: `
Lecture 6: GPT Evolution — Decoder-Only Models and Their Impact

KEY CONCEPTS AND TERMS:
- GPT (Generative Pre-Trained Transformer): OpenAI's decoder-only Transformer trained on next-token prediction
- Decoder-Only: Uses only the Transformer decoder stack with causal masking
- Autoregressive Generation: Generate tokens one at a time, each conditioned on all previous tokens
- Causal Masking (Masked Multi-Head Attention): Each position can only attend to previous positions — prevents "peeking" at future tokens
- Next-Token Prediction: Fundamental training objective for all GPT models
- Softmax Output: Probability distribution over vocabulary for next token
- Few-Shot Learning: Model performs new tasks from a few examples in the prompt — no fine-tuning needed
- Emergent Capability: Abilities that appear at scale but not in smaller models
- Zero-Shot: Model performs task with no examples, just instruction
- In-Context Learning: Learning task pattern from examples in the prompt

GPT EVOLUTION:
- GPT-1 (2018): 117M params. Introduced unsupervised pretraining + supervised fine-tuning paradigm. BooksCorpus.
- GPT-2 (2019): 1.5B params (10x). Better generation, zero-shot learning. Raised ethical concerns over misuse.
- GPT-3 (2020): 175B params (100x). Few-shot learning emerges. Common Crawl dataset. Human-like text.
- GPT-3.5 (ChatGPT era): 175B, 96 layers, 4096 context window. RLHF alignment. Public access via ChatGPT.
- GPT-4 (2023): ~1T params. Multimodal (text + image). 32,768 token context. Advanced reasoning.

RLHF (Reinforcement Learning from Human Feedback):
1. SFT (Supervised Fine-Tuning): Human labelers write ideal responses → train GPT to mimic
2. Reward Model: SFT model generates multiple responses; humans rank them; reward model learns to score
3. PPO (Proximal Policy Optimization): Optimize policy to maximize reward signal — align with human preferences

CAUSAL MASKING MATRIX:
- tok1 can see: tok1 only
- tok2 can see: tok1, tok2
- tok3 can see: tok1, tok2, tok3
- etc. (strictly left-to-right)

WHY DECODER-ONLY WON:
- Natural generation (autoregressive matches the goal)
- Scalability (simple objective, scales to trillions of params)
- Unified tasks (chat, code, translation — one interface)
- Efficiency (100% token training vs BERT's 15%)

GPT-2 DRAWBACKS: limited output control, misuse risk, heavy compute
GPT-3 DRAWBACKS: bias, hallucinations, weak interpretability
GPT-4 DRAWBACKS: bias, misinformation, rate-limited access, opaque internals
`.trim()
  },
  {
    id: 7,
    number: '07',
    title: 'T5: Text-to-Text Transfer Transformer',
    subtitle: 'Unified Framework, Denoising, C4 Corpus, Multi-Task',
    content: `
Lecture 7: T5 — Text-to-Text Transfer Transformer

KEY CONCEPTS AND TERMS:
- T5: Text-To-Text Transfer Transformer. Google, 2020. Unified framework for all NLP tasks.
- Text-to-Text Framework: Every NLP task formatted as: text input → text output. No task-specific heads.
- Task Prefixes: Tasks distinguished by prefix (e.g., "translate English to French: ...", "summarize: ...", "question: ... context: ...")
- Encoder-Decoder Architecture: Full Transformer with 12-layer encoder + 12-layer decoder (like original Transformer)
- Relative Positional Embeddings: Shared across all layers — more flexible than absolute positions
- C4 (Colossal Clean Crawled Corpus): 750GB+ filtered internet text. Filtering: remove profanity, boilerplate, non-English, short pages, duplicates
- Denoising Objective (Span Corruption): Hide spans of text, replace with sentinel tokens (<X>, <Y>), model reconstructs original

ARCHITECTURE SPECS:
- 12 encoder layers + 12 decoder layers
- Hidden dimension: 768
- Feed-forward dimension: 3072
- 12 attention heads
- ~220M parameters (similar to BERT-Base)
- Sequence length: 512, Batch size: 128, Pre-training steps: 524,288
- Dropout: 0.1 on attention weights, feed-forward, skip connections
- TPU Pod training with Mesh TensorFlow (data + model parallelism)

SPAN CORRUPTION EXAMPLE:
- Original: "The quick brown fox jumped over the lazy dog."
- Corrupted input: "<X> jumped over <Y>"
- Target output: "<X> The quick brown fox <Y> the lazy dog"

T5 vs BERT vs GPT:
- T5: Encoder+Decoder, span denoising, best at translation/summarization/QA/classification
- BERT: Encoder-only, MLM, best at classification/NER/sentence understanding, can't generate
- GPT: Decoder-only, causal LM, best at text generation/dialogue/creative writing, misses future context

BENCHMARK RESULTS:
- GLUE and SuperGLUE: SOTA on many tasks
- CNN/DailyMail summarization: SOTA
- SQuAD QA: SOTA
- Multi-task training: one model handles all tasks simultaneously

WEAKNESSES:
- Heavy inference: both encoder and decoder active at runtime (expensive vs encoder-only or decoder-only)
- Complex fine-tuning: all tasks must be formatted as text strings
- No specialization: not ideal for sequence tagging or structured output tasks
- Preprocessing overhead: task formatting adds complexity
`.trim()
  },
  {
    id: 8,
    number: '08',
    title: 'LLaMA 3: Open Foundation Models',
    subtitle: 'Architecture, Pre-Training, Post-Training, RLHF, Capabilities',
    content: `
Lecture 8: LLaMA 3 — Large Language Model Meta AI

KEY CONCEPTS AND TERMS:
- LLaMA 3: Meta's open-weights foundation model herd. 8B, 70B, and 405B parameter variants.
- Foundation Model: General model trained at massive scale, designed for a large variety of AI tasks
- Herd of Models: Multiple sizes (8B, 70B, 405B) for different compute/capability tradeoffs
- Dense Transformer: Standard Transformer architecture (not sparse/MoE), trained to be maximally data-efficient

ARCHITECTURE INNOVATIONS:
- Grouped Query Attention (GQA): 8 key-value heads (not one per query head) — faster inference, smaller KV cache
- 128K token vocabulary: 100K from tiktoken + 28K for non-English languages
- RoPE (Rotary Positional Embedding): Relative position encoding, base frequency 500K for long context
- Attention mask: Prevents cross-document attention within same sequence batch
- Context length: Extended from 8K → 128K tokens via long-context pre-training phase

PRE-TRAINING RECIPE (3 stages):
1. Initial Pre-Training: Standard next-word prediction on curated web + code + multilingual data
2. Long-Context Pre-Training: Extended context window to 128K tokens with long-sequence data
3. Annealing: Final 40M tokens — linear LR decay to 0, upsample highest-quality data sources

DATA CURATION:
- Sources: Web, books, code, scientific papers, multilingual content
- De-duplication methods and data cleaning on each source
- Remove PII (personally identifiable information) domains
- Remove adult content domains

POST-TRAINING PIPELINE:
1. Reward Model Training: Train RM on human-annotated preference data (human rankings of responses)
2. Supervised Fine-Tuning (SFT): Fine-tune on human-written instruction-response pairs
3. Direct Preference Optimization (DPO): Align model with human preferences (alternative to PPO)
4. Multiple rounds: SFT → DPO → SFT → DPO (iterative refinement)

CAPABILITIES:
- Code: Code generation expert + synthetic SFT data + quality filtering
- Multilinguality: Multilingual expert training + instruction tuning in many languages
- Math & Reasoning: Chain-of-thought, external tool use (Python interpreter, search engine, math engine)
- Long Context: 128K token context window — entire codebases, books, long conversations
- Tool Use: Search engine, Python interpreter, mathematical computation engine
- Factuality: "Know what it knows" — knowledge probing technique, reduce hallucination by aligning with pre-training facts

HALLUCINATION CHALLENGE:
- Models tend to be overconfident even in domains with little training data
- Post-training teaches model to say "I don't know" in uncertain domains
- Knowledge probing: compare model generations against factual pre-training data

LLaMA 3 vs GPT-4 / Claude:
- Open weights: downloadable, locally deployable
- 405B approaching frontier model performance
- Strong multilingual and coding capabilities
- Community can fine-tune and extend
`.trim()
  },
]

export function getLecturesInRange(from, to) {
  return LECTURES.filter(l => l.id >= from && l.id <= to)
}

export function getCombinedContent(from, to) {
  return getLecturesInRange(from, to)
    .map(l => `=== LECTURE ${l.number}: ${l.title} ===\n${l.content}`)
    .join('\n\n')
}
