function IBeforeExceptC(word) {
  const lowerWord = word.toLowerCase();

  for (let i = 0; i < lowerWord.length - 1; i++) {
    // Check for 'ie' digraph
    if (lowerWord[i] === 'i' && lowerWord[i + 1] === 'e') {
      // 'ie' preceded by 'c' violates the rule (should be 'ei')
      if (i > 0 && lowerWord[i - 1] === 'c') {
        return false;
      }
    }
    // Check for 'ei' digraph
    else if (lowerWord[i] === 'e' && lowerWord[i + 1] === 'i') {
      // 'ei' NOT preceded by 'c' violates the rule (should be 'ie')
      if (i === 0 || lowerWord[i - 1] !== 'c') {
        return false;
      }
    }
  }

  return true;
}
