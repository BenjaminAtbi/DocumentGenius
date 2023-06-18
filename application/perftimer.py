
from time import perf_counter

class perftimer():

    def __init__(self):
        self.timepoints = []
        self.ref_time = None

    def initialize(self):
        self.timepoints = []
        self.ref_time = perf_counter()
        print(f"timepoint 0 - start")
        self.timepoints.append("0 - start")

    def timepoint(self, label):
        current_time = perf_counter()
        elapsed_time = current_time - self.ref_time
        self.ref_time = current_time

        timepoint = f"{elapsed_time:0.2f} - {label}"
        print(timepoint)
        self.timepoints.append(timepoint)

    def conclude(self, label):
        self.timepoint(label)
        print("list of timepoints:")
        for timepoint in self.timepoints:
            print(timepoint)

    def dumptimepoints(self):
        return self.timepoints
    