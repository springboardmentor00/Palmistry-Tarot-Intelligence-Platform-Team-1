import random


class DummyPalmistryModel:

    def __init__(self):
        print("Dummy Palmistry Model Loaded")


    def predict(self, image_path):

        # -------------------------------------------------
        # DUMMY PREDICTION
        # -------------------------------------------------
        # This is NOT a real ML prediction.
        # It is only for frontend/backend integration.
        # -------------------------------------------------

        result = {

            "success": True,

            "model": "dummy-palmistry-model",

            "message": "Dummy prediction generated successfully",

            "lines": {

                "life_line": {
                    "detected": True,
                    "confidence": 0.94,
                    "points": [
                        [420, 700],
                        [450, 650],
                        [480, 600],
                        [520, 550]
                    ]
                },

                "head_line": {
                    "detected": True,
                    "confidence": 0.91,
                    "points": [
                        [500, 580],
                        [560, 560],
                        [620, 550],
                        [700, 540]
                    ]
                },

                "heart_line": {
                    "detected": True,
                    "confidence": 0.89,
                    "points": [
                        [400, 500],
                        [470, 490],
                        [550, 480],
                        [650, 490]
                    ]
                },

                "fate_line": {
                    "detected": True,
                    "confidence": 0.76,
                    "points": [
                        [570, 750],
                        [575, 680],
                        [580, 600],
                        [590, 520]
                    ]
                },

                "sun_line": {
                    "detected": False,
                    "confidence": 0.32,
                    "points": []
                }
            }
        }

        return result
