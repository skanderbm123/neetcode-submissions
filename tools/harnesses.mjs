/**
 * Full Java source for Harness.java (compiled next to user Solution.java).
 * Do not reference Solution methods in helpers that are not used by that problem,
 * or javac will still type-check unused static methods.
 */

function buildHarness(extraStatics, mainMethod) {
  return `import java.util.*;

class Harness {
  static void expect(String name, boolean ok, String detail) {
    if (!ok) {
      throw new RuntimeException("FAIL " + name + (detail.isEmpty() ? "" : ": " + detail));
    }
  }

  static void expectInt(String name, int exp, int act) {
    if (exp != act) {
      throw new RuntimeException("FAIL " + name + ": expected " + exp + " got " + act);
    }
  }
${extraStatics}
${mainMethod}
}
`;
}

export const harnessBodies = {
  longestSubstring: buildHarness(
    "",
    `
  public static void main(String[] args) {
    Solution sol = new Solution();
    expectInt("abcabcbb", 3, sol.lengthOfLongestSubstring("abcabcbb"));
    expectInt("bbbbb", 1, sol.lengthOfLongestSubstring("bbbbb"));
    expectInt("pwwkew", 3, sol.lengthOfLongestSubstring("pwwkew"));
    expectInt("empty", 0, sol.lengthOfLongestSubstring(""));
    expectInt("dvdf", 3, sol.lengthOfLongestSubstring("dvdf"));
    System.out.println("All tests passed.");
  }`
  ),

  twoSum: buildHarness(
    `
  static void checkTwoSum(Solution sol, int[] nums, int target) {
    int[] r = sol.twoSum(nums, target);
    expect("twoSum len", r.length == 2, "got " + r.length);
    int i = r[0], j = r[1];
    expect("twoSum i", i >= 0 && i < nums.length, "i=" + i);
    expect("twoSum j", j >= 0 && j < nums.length, "j=" + j);
    expect("twoSum distinct", i != j, "same index");
    expect(
        "twoSum sum",
        nums[i] + nums[j] == target,
        "nums[" + i + "]=" + nums[i] + " nums[" + j + "]=" + nums[j]);
  }`,
    `
  public static void main(String[] args) {
    Solution sol = new Solution();
    checkTwoSum(sol, new int[] { 2, 7, 11, 15 }, 9);
    checkTwoSum(sol, new int[] { 3, 2, 4 }, 6);
    checkTwoSum(sol, new int[] { 3, 3 }, 6);
    System.out.println("All tests passed.");
  }`
  ),

  isPalindrome: buildHarness(
    "",
    `
  public static void main(String[] args) {
    Solution sol = new Solution();
    expect("1", sol.isPalindrome("A man, a plan, a canal: Panama"), "");
    expect("2", !sol.isPalindrome("race a car"), "");
    expect("3", sol.isPalindrome(" "), "");
    expect("4", sol.isPalindrome(".,"), "");
    System.out.println("All tests passed.");
  }`
  ),

  isAnagram: buildHarness(
    "",
    `
  public static void main(String[] args) {
    Solution sol = new Solution();
    expect("1", sol.isAnagram("anagram", "nagaram"), "");
    expect("2", !sol.isAnagram("rat", "car"), "");
    expect("3", !sol.isAnagram("a", "ab"), "");
    System.out.println("All tests passed.");
  }`
  ),

  duplicateInteger: buildHarness(
    "",
    `
  public static void main(String[] args) {
    Solution sol = new Solution();
    expect("dup", sol.hasDuplicate(new int[] { 1, 2, 3, 1 }), "");
    expect("nodup", !sol.hasDuplicate(new int[] { 1, 2, 3, 4 }), "");
    expect("empty", !sol.hasDuplicate(new int[] {}), "");
    System.out.println("All tests passed.");
  }`
  ),

  anagramGroups: buildHarness(
    `
  static String canonGroups(List<List<String>> g) {
    List<String> parts = new ArrayList<>();
    for (List<String> inner : g) {
      List<String> c = new ArrayList<>(inner);
      Collections.sort(c);
      parts.add(String.join(",", c));
    }
    Collections.sort(parts);
    return String.join("|", parts);
  }`,
    `
  public static void main(String[] args) {
    Solution sol = new Solution();
    String[] in = { "eat", "tea", "tan", "ate", "nat", "bat" };
    String exp =
        canonGroups(
            Arrays.asList(
                Arrays.asList("bat"),
                Arrays.asList("nat", "tan"),
                Arrays.asList("ate", "eat", "tea")));
    String got = canonGroups(sol.groupAnagrams(in));
    expect("group", exp.equals(got), exp + " vs " + got);
    expect("single", sol.groupAnagrams(new String[] { "" }).size() == 1, "");
    expect("empty input", sol.groupAnagrams(new String[] {}).size() == 0, "");
    System.out.println("All tests passed.");
  }`
  ),
};
