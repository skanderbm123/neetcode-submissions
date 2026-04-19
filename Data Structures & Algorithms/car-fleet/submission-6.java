class Solution {
    public int carFleet(int target, int[] position, int[] speed) {
        int n = position.length;
        if (n == 0) {
            return 0;
        }

        Integer[] order = new Integer[n];
        for (int i = 0; i < n; i++) {
            order[i] = i;
        }
        Arrays.sort(order, (a, b) -> Integer.compare(position[a], position[b]));

        int fleets = 0;
        double slowestAhead = 0;
        for (int k = n - 1; k >= 0; k--) {
            int i = order[k];
            double time = (double) (target - position[i]) / speed[i];
            if (time > slowestAhead) {
                slowestAhead = time;
                fleets++;
            }
        }
        return fleets;
    }
}
