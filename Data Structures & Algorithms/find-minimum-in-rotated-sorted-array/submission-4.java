class Solution {
    public int findMin(int[] nums) {
        return findSorted(nums, 0, nums.length - 1);
    }

    public int findSorted(int[] nums, int left, int right) {
        if (left == right) return nums[left];

        int mid = left + (right - left) / 2;

        // RIGHT HALF IS UNSORTED
        if (nums[mid] > nums[right]) {
           return findSorted(nums, mid + 1, right);
        }
        // LEFT HALF IS UNSORTED
        else {
            return findSorted(nums, left, mid);
        }
    }
}