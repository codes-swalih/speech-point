import { NextRequest, NextResponse } from "next/server";

// Enhanced summarization function
const enhancedSummarize = async (text: string) => {
  console.log("Using enhanced summarization service");
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Clean and normalize the text
  const cleanText = text.replace(/\s+/g, ' ').trim();
  
  // Split into sentences and filter out very short ones
  const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 15);
  
  if (sentences.length === 0) {
    return {
      points: [
        {
          point: "Insufficient content for analysis",
          details: "The provided transcription was too short or unclear to extract meaningful points."
        }
      ]
    };
  }
  
  // Identify potential key sentences based on signal words and position
  const scoredSentences = sentences.map((sentence, index) => {
    let score = 0;
    
    // Position-based scoring (beginning and end sentences often contain key information)
    if (index < sentences.length * 0.2) score += 2; // Beginning of text
    if (index > sentences.length * 0.8) score += 2; // End of text
    
    // Content-based scoring
    const lowerSentence = sentence.toLowerCase();
    
    // Signal phrases that often indicate important points
    const signalPhrases = [
      'important', 'significant', 'key', 'main', 'critical', 'essential',
      'must', 'should', 'need to', 'have to', 'conclusion', 'therefore',
      'in summary', 'to summarize', 'finally', 'firstly', 'secondly', 'thirdly',
      'in conclusion', 'to conclude', 'overall', 'ultimately'
    ];
    
    signalPhrases.forEach(phrase => {
      if (lowerSentence.includes(phrase)) score += 2;
    });
    
    // Length-based scoring (medium-length sentences often contain complete thoughts)
    const wordCount = sentence.split(/\s+/).length;
    if (wordCount > 8 && wordCount < 25) score += 1;
    
    return { sentence: sentence.trim(), score, index };
  });
  
  // Sort by score and take top sentences
  const topSentences = scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(5, Math.max(3, Math.ceil(sentences.length / 5))));
  
  // Sort back by original position for context coherence
  const orderedTopSentences = topSentences.sort((a, b) => a.index - b.index);
  
  // Generate key points with context
  const keyPoints = orderedTopSentences.map((item, i) => {
    // Create a concise point headline
    const words = item.sentence.split(/\s+/);
    const point = words.length > 10 
      ? words.slice(0, 10).join(' ') + '...'
      : item.sentence;
    
    // Get context from surrounding sentences for details
    const contextIndex = Math.min(
      Math.max(0, item.index + 1),
      sentences.length - 1
    );
    
    let details = sentences[contextIndex].trim();
    if (details === item.sentence) {
      // If the context is the same as the point, try another sentence
      details = sentences[Math.min(item.index + 2, sentences.length - 1)].trim();
    }
    
    return {
      point: point,
      details: details
    };
  });
  
  return {
    points: keyPoints.length > 0 ? keyPoints : [
      {
        point: "Key information extracted",
        details: "The transcription contained valuable information but specific points couldn't be clearly identified."
      }
    ]
  };
};

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    
    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    console.log("Summarizing text:", text.substring(0, 100) + "...");

    // Generate key points from the text using enhanced algorithm
    const keyPoints = await enhancedSummarize(text);

    return NextResponse.json(keyPoints);
  } catch (error) {
    console.error("Error summarizing text:", error);
    return NextResponse.json(
      { error: `Failed to summarize text: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
