#include "vehicle.h"
#include "globalvariables.h"

Vehicle::Vehicle(QGraphicsItem * parent)
	:
	MovingItem(parent),
	hitpoints_(1),
	indestructible_(false),
	diplomacy_(0),
	age_(0),
	size_(2),
	shape(NULL),
	wormholeFrame_(0),
    wormholeState_(OUTSIDE),
	isProjectile_(false),
	isPlayer_(false),
	isAsteroid_(false),
	_control_heading(0.0),
	_control_position(0.0),
	_engine_main_power(0.0)
{
}

void Vehicle::advance(int phase)
{
	if(phase == 1 && isAdvancing())
	{
            if(wormholeState_ == VANISH && wormholeFrame_ < 255) // vanish effect, "get sucked in by wormhole"
			{
				setWormholeFrame(wormholeFrame_+5);
			}
            else if(wormholeState_ == VANISH && wormholeFrame_ >= 255)
			{
                wormholeState_ = INSIDE;
			}
            else if(wormholeState_ == APPEAR && wormholeFrame_ > 0) // appear effect, "get out of wormhole"
			{
				setWormholeFrame(wormholeFrame_-5);
			}
            else if(wormholeState_ == APPEAR && wormholeFrame_ <= 0)
			{
                wormholeState_ = OUTSIDE;
			}
		else
			AnimatedItem::advance(phase);

		MovingItem::advance(phase);
	}
}

void Vehicle::paint(QPainter *painter, const QStyleOptionGraphicsItem* option, QWidget* widget)
{
	Q_UNUSED(option);
	Q_UNUSED(widget);

    if(wormholeState_ == APPEAR || wormholeState_ == VANISH)
		painter->drawImage(offset(), effectImage);
    else if(wormholeState_ == INSIDE)
		return;

	else
	AnimatedItem::paint(painter,option,widget);
}

void Vehicle::setWormholeFrame(int frame)
{
	int newFrame = frame % 256;
	if(wormholeFrame_ != newFrame)
	{
		wormholeFrame_ = newFrame;
		animate(wormholeFrame_);
	}
}

void Vehicle::setHitpoints(int hitpoints)
{
    if(indestructible_ || wormholeState_ !=OUTSIDE ) // indestructible vehicles only gain, but never loose hitpoints
	{
		hitpoints_ = hitpoints > hitpoints_ ? hitpoints : hitpoints_;
	}
	else // hitpoints can not be negative
		hitpoints_ = hitpoints > 0 ? hitpoints : 0;
}

void Vehicle::beginWormholeTravel()
{
	setWormholeFrame(0);
    wormholeState_ = VANISH;
}

void Vehicle::endWormholeTravel()
{
	body()->SetLinearVelocity(b2Vec2(0.0f,0.0f)); // stop movement
	setWormholeFrame(255);
    wormholeState_ = APPEAR;
}

/*virtual*/ void Vehicle::fileChanged()
{
	// update wormhole effect image
    sourceImage = this->imageAt(0).convertToFormat(QImage::Format_ARGB32_Premultiplied);
	setupWormhole();
	animate(wormholeFrame_);
}

void Vehicle::setupWormhole()
{
	int hh = (int)(boundingRect().height());
	int ww = (int)(boundingRect().width());
	effectImage = QImage(ww, hh, QImage::Format_ARGB32_Premultiplied);

	delete [] shape;
	shape = new int[hh*2];

	qreal y1 = 1 - 1 / (1 + exp(-3));
	qreal y2 = 1 - 1 / (1 + exp(3));
	for (int i = 0; i < boundingRect().height(); i++)
	{
		qreal x = (qreal)i * 6 / boundingRect().height() - 3;
		qreal y = 1 - 1 / (1 + exp(x));
		qreal ya = (y - y1) / (y2 - y1);
		shape[i * 2] = (int)(ya * effectImage.width());
		shape[i * 2 + 1] = (int)(ya * (effectImage.width() - sourceImage.width()));
	}
}

void Vehicle::animate(int frame)
{

	effectImage.fill(0);

	int sw = sourceImage.width();
	int sh = sourceImage.height();
	int fh = effectImage.height();

		int dp = qMin(255, 2 * frame);
	int y1 = (fh * frame) >> 8;
	int y2 = ((fh - sh) * dp) >> 8;
	int yr = y2 - y1 + sh;
	if (yr <= 0)
		return;
	int dy = (sh << 8) / yr;

	const quint32 *bits = reinterpret_cast<quint32*>(sourceImage.bits());
	int words = sourceImage.bytesPerLine() / 4;
	quint32 *dest = reinterpret_cast<quint32*>(effectImage.scanLine(y1));
	int stride = effectImage.bytesPerLine() / 4;
	int *ptr = shape + y1 * 2;

	int dx = 0;

	for (int sy = 0; yr; --yr, sy += dy, dest += stride) {
		const quint32 *src = bits + (sy >> 8) * words;
		int x1 = (*ptr++ * dp) >> 8;
		int x2 = (*ptr++ * dp) >> 8;
		quint32 *q = dest + x1;
		int xr = x2 - x1 + sw;
#if 0
		// enable this block to optimize the division to be carried out
		// approximately for every 8 rows only
		// this gives less perfect scaling
		if (!dx || !(yr & 7))
#endif
		dx = (sw << 8) / xr;
		for (int sx = 0; xr; --xr, sx += dx)
			*q++ = src[sx >> 8];
	}

	update();
}



