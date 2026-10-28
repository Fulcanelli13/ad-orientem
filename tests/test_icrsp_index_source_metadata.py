"""Offline source-indexer parsing checks for issue #1665. No network access needed."""
import importlib.util
from pathlib import Path
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / "tools" / "icrsp" / "index_source_metadata.py"
spec = importlib.util.spec_from_file_location("icrsp_indexer", SCRIPT)
indexer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(indexer)

class ICRSPIndexerTests(unittest.TestCase):
    def test_deduplicate_and_keep_occurrences(self):
        html = """
        <h2>Temporal</h2><h3>Advent</h3>
        <a href="textes-liturgiques.php?article=a0088_ancien">1er dimanche</a>
        <a href="/textes-liturgiques.php?article=a0088_ancien">alias</a>
        <h2>Sanctoral</h2>
        <a href="?article=a0665_ancien">St Blaise</a>
        <a href="https://unrelated.example/?article=a0031_nouveau">Do not import</a>
        """
        occurrences, pages = indexer.discover(html)
        self.assertEqual(len(occurrences), 3)
        self.assertEqual(len(pages), 2)
        self.assertEqual(pages[0]["sections"], ["temporal"])
        self.assertEqual(pages[1]["sections"], ["sanctoral"])
        self.assertEqual(pages[0]["labels"], ["1er dimanche", "alias"])

    def test_article_key_does_not_imply_edition(self):
        url = indexer.article_url("?article=a0010_nouveau")
        self.assertTrue(url.endswith("a0010_nouveau"))
        _, pages = indexer.discover('<a href="?article=a0010_nouveau">Palm Sunday before 1955</a>')
        self.assertEqual(pages[0]["edition"], "UNVERIFIED_DO_NOT_READ_URL_SUFFIX")

    def test_headings_extraction(self):
        p = indexer.ArticleHTML()
        p.feed("<h2>First Sunday</h2><h3>Commentaires</h3>")
        self.assertEqual(p.headings, [
            {"level": "h2", "text": "First Sunday"},
            {"level": "h3", "text": "Commentaires"}
        ])

if __name__ == "__main__":
    unittest.main()
