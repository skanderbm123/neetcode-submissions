class Solution {
    public int search(int[] nums, int target) {
        return findSorted(nums, 0, nums.length - 1, target);
    }

    public int findSorted(int[] nums, int left, int right, int target) {
        if (left > right) return -1;

        int mid = left + (right - left) / 2;

        if (nums[mid] == target) return mid;

        // LEFT HALF IS SORTED
        if (nums[left] <= nums[mid]) {
            if (target >= nums[left] && target < nums[mid]) {
                return findSorted(nums, left, mid - 1, target);
            } else {
                return findSorted(nums, mid + 1, right, target);
            }
        }
        // RIGHT HALF IS SORTED
        else {
            if (target > nums[mid] && target <= nums[right]) {
                return findSorted(nums, mid + 1, right, target);
            } else {
                return findSorted(nums, left, mid - 1, target);
            }
        }
    }
}