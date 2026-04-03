class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
       Map<String, List<String>> anagrams = new HashMap<>();
       for(String str : strs) {
        char[] charArray = str.toCharArray();
        Arrays.sort(charArray);
        String sorted = new String(charArray);
        anagrams.computeIfAbsent(sorted, k -> new ArrayList<>()).add(str);
       }

       return new ArrayList<>(anagrams.values());
    }
}
