# MU 宝石/货币数据包

来源：mu.dvg.cn/item_list.php?atype=9。

文件：
- mu_gems.csv：表格导入版
- mu_gems.json：程序读取版
- schema_mysql.sql：MySQL建表与INSERT脚本
- icon_manifest.json：图标URL清单
- download_icons.py：运行后下载图标到 icons/

说明：当前执行环境无法直接联网下载图片文件，所以 icons 目录内未内置图片；已完整保留官方图标URL和本地目标路径。把压缩包解压后运行：
python download_icons.py
即可下载全部图标。
