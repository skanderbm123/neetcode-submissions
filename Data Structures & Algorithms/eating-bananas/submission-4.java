class Solution {
    public int minEatingSpeed(int[] piles, int h) {
        // 1. Define search range for k (speed)
        int left = 1;                 // minimum possible speed
        int right = getMax(piles);    // maximum needed speed

        int answer = right;

        // 2. Binary search on possible speeds
        while (left <= right) {
            int mid = left + (right - left) / 2; // current speed guess

            // 3. Check if this speed works
            if (canFinish(piles, h, mid)) {
                // mid works → try smaller speed
                answer = mid;
                right = mid - 1;
            } else {
                // mid too slow → increase speed
                left = mid + 1;
            }
        }

        return answer;
    }

    // Helper: check if Koko can finish within h hours at speed k
    private boolean canFinish(int[] piles, int h, int k) {
        int hours = 0;

        for (int pile : piles) {
            // ceil(pile / k)
            hours += (pile + k - 1) / k;
        }

        return hours <= h;
    }

    // Helper: find maximum pile
    private int getMax(int[] piles) {
        int max = 0;
        for (int p : piles) {
            max = Math.max(max, p);
        }
        return max;
    }
}