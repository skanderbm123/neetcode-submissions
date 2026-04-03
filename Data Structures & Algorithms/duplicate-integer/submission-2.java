class Solution {
    public boolean hasDuplicate(int[] nums) {
        HashSet<Integer> duplicates = new HashSet<Integer>();

        for(int i: nums) {
            if (duplicates.contains(i)){
                return true;
            }
            duplicates.add(i);
        }
        return false;
    }
}